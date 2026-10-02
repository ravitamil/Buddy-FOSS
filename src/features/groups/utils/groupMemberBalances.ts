import {Transaction, GroupMember} from '../../../types';
import {EnhancedGroupMember} from '@/features/groups/types';
import {calculateGroupBalance} from '../../../utils/groupBalanceUtils.optimized';
import {prepareTransactionsWithFx} from '../../../utils/prepareFx';

export const calculateGroupMemberBalances = (
  members: EnhancedGroupMember[],
  transactions: Transaction[],
  groupCurrency: string,
): EnhancedGroupMember[] => {
  const txWithFx = prepareTransactionsWithFx(transactions, groupCurrency);
  const groupBalance = calculateGroupBalance(txWithFx, members as unknown as GroupMember[]);

  return members.map((member) => {
    const balance = groupBalance.memberBalances.find(
      (memberBalance) => memberBalance.memberId === member.id,
    );
    return {
      ...member,
      balance: balance?.balance ?? 0,
      totalPaid: balance?.totalPaid ?? 0,
      totalOwed: balance?.totalOwed ?? 0,
      updatedAt: new Date(),
    };
  });
};
