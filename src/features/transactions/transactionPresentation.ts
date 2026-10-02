import type {Transaction} from '@/types';

export type TransactionSettlementStatus = 'settled' | 'unsettled' | 'partial';

interface TransactionGroupMemberLike {
  id: string;
  name?: string;
  supabaseUserId?: string;
}

export interface TransactionGroupLike {
  id: string;
  name: string;
  emoji?: string;
  members?: TransactionGroupMemberLike[];
}

const SETTLEMENT_DESCRIPTION_PATTERN = /^(?:repayment|settlement) from (.+?) to (.+)$/i;
const SETTLEMENT_EPSILON = 0.01;

export const isSettlementTransaction = (transaction: Transaction): boolean =>
  transaction.isSettlement === true ||
  transaction.category.toLowerCase() === 'settlement' ||
  SETTLEMENT_DESCRIPTION_PATTERN.test(transaction.description);

const findCurrentMemberId = (
  group: TransactionGroupLike | undefined,
  currentUserId: string | undefined,
): string | undefined => {
  if (!currentUserId) return undefined;

  return (
    group?.members?.find(
      (member) => member.id === currentUserId || member.supabaseUserId === currentUserId,
    )?.id ?? currentUserId
  );
};

const namesFromDescription = (description: string): {payerName?: string; receiverName?: string} => {
  const match = description.match(SETTLEMENT_DESCRIPTION_PATTERN);
  return match ? {payerName: match[1].trim(), receiverName: match[2].trim()} : {};
};

const isCurrentUserName = (
  participantName: string | undefined,
  currentUserName?: string,
): boolean =>
  Boolean(
    participantName &&
    (participantName.trim().toLowerCase() === 'you' ||
      participantName.trim().toLowerCase() === currentUserName?.trim().toLowerCase()),
  );

export const getSettlementDescription = ({
  transaction,
  group,
  currentUserId,
  currentUserName,
}: {
  transaction: Transaction;
  group?: TransactionGroupLike;
  currentUserId?: string;
  currentUserName?: string;
}): string => {
  const currentMemberId = findCurrentMemberId(group, currentUserId);
  const payer = group?.members?.find((member) => member.id === transaction.paidBy);
  const receiverId =
    transaction.receivedBy?.[0] ??
    transaction.splitAmong?.find((memberId) => memberId !== transaction.paidBy);
  const receiver = group?.members?.find((member) => member.id === receiverId);
  const parsedNames = namesFromDescription(transaction.description);
  const payerName = payer?.name ?? parsedNames.payerName;
  const receiverName = receiver?.name ?? parsedNames.receiverName;
  const isReceiver =
    (Boolean(currentMemberId) && receiverId === currentMemberId) ||
    isCurrentUserName(receiverName, currentUserName);
  const isPayer =
    (Boolean(currentMemberId) && transaction.paidBy === currentMemberId) ||
    isCurrentUserName(payerName, currentUserName);

  if (isReceiver && payerName) return `Repayment from ${payerName}`;
  if (isPayer && receiverName) return `Repayment to ${receiverName}`;
  if (payerName && receiverName) return `${payerName} → ${receiverName}`;

  return transaction.description || 'Debt Settlement';
};

const getSplitStatus = ({
  amount,
  isPaid,
  settledAmount = 0,
}: {
  amount: number;
  isPaid?: boolean;
  settledAmount?: number;
}): TransactionSettlementStatus => {
  if (isPaid || settledAmount >= Math.abs(amount) - SETTLEMENT_EPSILON) return 'settled';
  return settledAmount > SETTLEMENT_EPSILON ? 'partial' : 'unsettled';
};

export const getGroupExpenseSettlementStatus = (
  transaction: Transaction,
  group?: TransactionGroupLike,
  currentUserId?: string,
): TransactionSettlementStatus | undefined => {
  if (!transaction.splitDetails?.length || !currentUserId) return undefined;

  const currentMemberId = findCurrentMemberId(group, currentUserId);
  if (transaction.paidBy === currentMemberId) {
    const debtorSplits = transaction.splitDetails.filter(
      (split) => split.memberId !== currentMemberId,
    );
    if (!debtorSplits.length) return undefined;

    const statuses = debtorSplits.map(getSplitStatus);
    if (statuses.every((status) => status === 'settled')) return 'settled';
    if (statuses.some((status) => status !== 'unsettled')) return 'partial';
    return 'unsettled';
  }

  const currentUserSplit = transaction.splitDetails.find(
    (split) => split.memberId === currentMemberId,
  );
  return currentUserSplit ? getSplitStatus(currentUserSplit) : undefined;
};
