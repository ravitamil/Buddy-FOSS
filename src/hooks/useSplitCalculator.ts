import {GroupMember} from '../types';
import {roundToTwoDecimals} from '../utils/groupBalanceUtils.optimized';

export type SplitType = 'equal' | 'custom' | 'percentage' | 'shares';

const allocateProportionally = (total: number, weights: number[]): number[] => {
  const totalWeight = weights.reduce((sum, value) => sum + value, 0) || 1;
  const rawAmounts = weights.map((weight) => (total * weight) / totalWeight);
  const roundedAmounts = rawAmounts.map((value) => roundToTwoDecimals(value));
  let remainder = roundToTwoDecimals(total - roundedAmounts.reduce((sum, value) => sum + value, 0));
  const remainderOrder = rawAmounts
    .map((value, index) => ({index, fraction: value * 100 - Math.floor(value * 100)}))
    .sort((a, b) => b.fraction - a.fraction)
    .map((item) => item.index);
  const adjustedAmounts = [...roundedAmounts];
  let orderIndex = 0;

  while (remainder > 0.0001) {
    const amountIndex = remainderOrder[orderIndex % remainderOrder.length];
    adjustedAmounts[amountIndex] = roundToTwoDecimals(adjustedAmounts[amountIndex] + 0.01);
    remainder = roundToTwoDecimals(remainder - 0.01);
    orderIndex++;
  }

  return adjustedAmounts;
};

export function calculateSplitPreview(
  total: number,
  members: GroupMember[],
  splitType: SplitType,
  customAmounts: Record<string, string>,
  percentageAmounts: Record<string, string>,
  sharesAmounts: Record<string, string>,
): Record<string, number> {
  if (!members || members.length === 0 || total <= 0) return {};
  if (splitType === 'equal') {
    const each = roundToTwoDecimals(total / members.length);
    const amounts: Record<string, number> = {};
    members.forEach((m) => {
      amounts[m.id] = each;
    });
    const sum = Object.values(amounts).reduce((s, v) => s + v, 0);
    let rem = roundToTwoDecimals(total - sum);
    if (Math.abs(rem) > 0.0001) {
      const first = members[0]?.id;
      if (first) amounts[first] = roundToTwoDecimals(amounts[first] + rem);
    }
    return amounts;
  }
  if (splitType === 'custom') {
    const amounts: Record<string, number> = {};
    members.forEach((m) => {
      amounts[m.id] = roundToTwoDecimals(parseFloat(customAmounts[m.id]) || 0);
    });
    return amounts;
  }
  if (splitType === 'percentage') {
    const values = members.map((m) => parseFloat(percentageAmounts[m.id]) || 0);
    const adjusted = allocateProportionally(total, values.length > 0 ? values : [100]);
    const amounts: Record<string, number> = {};
    members.forEach((m, i) => {
      amounts[m.id] = adjusted[i];
    });
    return amounts;
  }
  const shares = members.map((m) => parseFloat(sharesAmounts[m.id]) || 0);
  const adjusted = allocateProportionally(total, shares);
  const amounts: Record<string, number> = {};
  members.forEach((m, i) => {
    amounts[m.id] = adjusted[i];
  });
  return amounts;
}

export function useSplitCalculator() {
  return {calculateSplitPreview};
}
