import {ContextError, generateEntityId} from '../../../types/context-foundation';
import {GroupMember, Transaction} from '../../../types';
import {EnhancedGroup, EnhancedGroupMember} from '@/features/groups/types';
import {
  calculateGroupBalance,
  roundToTwoDecimals,
} from '../../../utils/groupBalanceUtils.optimized';
import {prepareTransactionsWithFx} from '../../../utils/prepareFx';
import {
  applyDirectSettlement,
  buildSettlementTransaction,
  getSettledDebtAmountTotal,
  GroupSettlementInput,
} from '../utils/groupSettlement';

interface GroupSettlementLogger {
  debug: (message: string, data?: unknown) => void;
}

interface GroupSettlementActionDeps {
  groups: EnhancedGroup[];
  userId: string | undefined;
  groupCurrency: string;
  logger: GroupSettlementLogger;
  recalculateMemberBalances: (
    members: EnhancedGroupMember[],
    transactions: Transaction[],
    groupId: string,
  ) => EnhancedGroupMember[];
  updateGroup: (userId: string, group: EnhancedGroup) => Promise<void>;
  logActivity: (
    groupId: string,
    actorUserId: string | undefined,
    actorName: string,
    action: 'settlement_recorded',
    metadata: Record<string, unknown>,
  ) => void;
}

export interface RecordedSettlement {
  updatedGroup: EnhancedGroup;
  settlementTx: Transaction;
}

const SETTLEMENT_CONTEXT = 'GroupContext';
const SETTLEMENT_TOLERANCE = 0.01;

const findGroupOrThrow = (groups: EnhancedGroup[], groupId: string): EnhancedGroup => {
  const group = groups.find((candidate) => candidate.id === groupId);
  if (!group) throw new Error('Group not found');
  return group;
};

const assertSettlementMembers = (
  group: EnhancedGroup,
  settlement: GroupSettlementInput,
): {fromMember: EnhancedGroupMember; toMember: EnhancedGroupMember} => {
  const fromMember = group.members.find((member) => member.id === settlement.fromMemberId);
  const toMember = group.members.find((member) => member.id === settlement.toMemberId);

  if (!fromMember || !toMember) {
    throw new ContextError(
      'Invalid member IDs for settlement',
      'INVALID_SETTLEMENT_MEMBERS',
      SETTLEMENT_CONTEXT,
    );
  }

  if (fromMember.id === toMember.id) {
    throw new ContextError(
      'Cannot create settlement between the same member',
      'SELF_SETTLEMENT_ERROR',
      SETTLEMENT_CONTEXT,
    );
  }

  return {fromMember, toMember};
};

const assertDirectDebtCapacity = (
  group: EnhancedGroup,
  settlement: GroupSettlementInput,
  groupCurrency: string,
  fromMember: EnhancedGroupMember,
  toMember: EnhancedGroupMember,
): void => {
  const txWithFx = prepareTransactionsWithFx(group.transactions, groupCurrency);
  const calc = calculateGroupBalance(txWithFx, group.members as unknown as GroupMember[]);

  const payerBalanceRecord = calc.memberBalances.find(
    (memberBalance) => memberBalance.memberId === settlement.fromMemberId,
  );

  if (!payerBalanceRecord) {
    throw new ContextError(
      'Payer not found in group balances',
      'PAYER_NOT_FOUND',
      SETTLEMENT_CONTEXT,
    );
  }

  const directDebt = payerBalanceRecord.outstandingDebts.find(
    (debt) => debt.creditorId === settlement.toMemberId,
  );
  const maxSettlement = directDebt ? directDebt.amount : 0;

  if (maxSettlement <= SETTLEMENT_TOLERANCE) {
    throw new ContextError(
      `${fromMember.name} does not owe any money directly to ${toMember.name}`,
      'NO_DIRECT_DEBT',
      SETTLEMENT_CONTEXT,
    );
  }

  if (settlement.amount > maxSettlement + SETTLEMENT_TOLERANCE) {
    throw new ContextError(
      `Settlement amount (${settlement.amount.toFixed(2)}) exceeds the direct debt amount (${maxSettlement.toFixed(2)})`,
      'SETTLEMENT_EXCEEDS_DEBT',
      SETTLEMENT_CONTEXT,
    );
  }
};

export const createGroupSettlementActions = ({
  groups,
  userId,
  groupCurrency,
  logger,
  recalculateMemberBalances,
  updateGroup,
  logActivity,
}: GroupSettlementActionDeps) => ({
  recordGroupSettlement: async (
    groupId: string,
    settlement: GroupSettlementInput,
  ): Promise<RecordedSettlement> => {
    if (!userId) throw new Error('User not authenticated');
    const group = findGroupOrThrow(groups, groupId);

    if (settlement.amount <= 0) {
      throw new ContextError(
        'Settlement amount must be greater than 0',
        'INVALID_SETTLEMENT_AMOUNT',
        SETTLEMENT_CONTEXT,
      );
    }

    const {fromMember, toMember} = assertSettlementMembers(group, settlement);
    assertDirectDebtCapacity(group, settlement, groupCurrency, fromMember, toMember);

    const appliedSettlement = applyDirectSettlement(settlement, group.transactions);
    if (appliedSettlement.settledAmount > 0.001) {
      logger.debug(`Settled direct debt: ${appliedSettlement.settledAmount.toFixed(2)}`);
    }

    if (appliedSettlement.settledAmount <= SETTLEMENT_TOLERANCE) {
      throw new ContextError(
        'Unable to apply this settlement to outstanding direct debts. Please refresh and try again.',
        'SETTLEMENT_NOT_APPLIED',
        SETTLEMENT_CONTEXT,
      );
    }

    const remainingSettlementAmount = roundToTwoDecimals(appliedSettlement.remainingAmount);
    if (remainingSettlementAmount > SETTLEMENT_TOLERANCE) {
      throw new ContextError(
        `Settlement amount could not be fully mapped to unpaid splits. Unmapped amount: ${remainingSettlementAmount.toFixed(2)}`,
        'SETTLEMENT_MAPPING_MISMATCH',
        SETTLEMENT_CONTEXT,
      );
    }

    const settlementTx = buildSettlementTransaction({
      id: generateEntityId(),
      groupId,
      settlement,
      fromMember,
      toMember,
      settledExpenseIds: appliedSettlement.settledExpenseIds,
      settledDebtAmounts: appliedSettlement.settledDebtAmounts,
    });
    const totalStoredAmounts = getSettledDebtAmountTotal(settlementTx.settledDebtAmounts || {});

    if (Math.abs(totalStoredAmounts - settlement.amount) > SETTLEMENT_TOLERANCE) {
      throw new ContextError(
        `Settlement consistency check failed. Expected ${settlement.amount.toFixed(2)} but mapped ${totalStoredAmounts.toFixed(2)}.`,
        'SETTLEMENT_CONSISTENCY_FAILED',
        SETTLEMENT_CONTEXT,
      );
    }

    const finalTransactions = [...appliedSettlement.updatedTransactions, settlementTx];
    const finalMembers = recalculateMemberBalances(group.members, finalTransactions, groupId);
    const updatedGroup = {
      ...group,
      transactions: finalTransactions,
      members: finalMembers,
      updatedAt: new Date(),
    };

    await updateGroup(userId, updatedGroup);

    logActivity(groupId, userId, fromMember.name, 'settlement_recorded', {
      fromMemberId: settlement.fromMemberId,
      toMemberId: settlement.toMemberId,
      amount: settlement.amount,
    });

    return {updatedGroup, settlementTx};
  },
});
