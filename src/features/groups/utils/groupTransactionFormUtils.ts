import type {
  AddGroupTransactionCategory,
  GroupSplitType,
  GroupWithAvatarMembers,
} from '../types/addGroupTransaction';

export const isDecimalInput = (text: string): boolean => text === '' || /^\d*\.?\d*$/.test(text);

export function getExpenseCategories(
  categories: Array<{type: string; name: string}>,
): AddGroupTransactionCategory[] {
  return categories
    .filter((category) => category.type === 'expense')
    .sort((a, b) => {
      if (a.name === 'Other') {
        return -1;
      }
      if (b.name === 'Other') {
        return 1;
      }
      return a.name.localeCompare(b.name);
    }) as AddGroupTransactionCategory[];
}

export function calculateGroupSplitAmounts({
  group,
  amount,
  splitType,
  customAmounts,
  percentageAmounts,
  sharesAmounts,
}: {
  group: GroupWithAvatarMembers | null;
  amount: string;
  splitType: GroupSplitType;
  customAmounts: Record<string, string>;
  percentageAmounts: Record<string, string>;
  sharesAmounts: Record<string, string>;
}): Record<string, number> {
  if (!group) {
    return {};
  }

  const total = Number.parseFloat(amount) || 0;
  const amounts: Record<string, number> = {};

  if (splitType === 'equal') {
    const equalAmount = total / group.members.length;
    group.members.forEach((member) => {
      amounts[member.id] = equalAmount;
    });
    return amounts;
  }

  if (splitType === 'percentage') {
    group.members.forEach((member) => {
      const percentage = Number.parseFloat(percentageAmounts[member.id] ?? '') || 0;
      amounts[member.id] = (total * percentage) / 100;
    });
    return amounts;
  }

  if (splitType === 'custom') {
    group.members.forEach((member) => {
      amounts[member.id] = Number.parseFloat(customAmounts[member.id] ?? '') || 0;
    });
    return amounts;
  }

  const shares = group.members.map(
    (member) => Number.parseFloat(sharesAmounts[member.id] ?? '') || 0,
  );
  const totalShares = shares.reduce((sum, share) => sum + share, 0) || 1;
  group.members.forEach((member, index) => {
    amounts[member.id] = (total * (shares[index] ?? 0)) / totalShares;
  });
  return amounts;
}
