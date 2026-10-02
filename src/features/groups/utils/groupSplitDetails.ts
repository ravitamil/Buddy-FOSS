import {SplitDetail} from '../../../types';
import {EnhancedGroupMember} from '@/features/groups/types';
import {roundToTwoDecimals} from '../../../utils/groupBalanceUtils.optimized';

export type GroupSplitMethod = 'equal' | 'custom' | 'percentage' | 'shares';

const getActiveMembers = (members: EnhancedGroupMember[]): EnhancedGroupMember[] =>
  members.filter((member) => member.isActive);

const getMemberName = (
  memberId: string,
  memberName: string | undefined,
  activeMembers: EnhancedGroupMember[],
): string =>
  memberName || activeMembers.find((member) => member.id === memberId)?.name || 'Unknown';

const distributeRoundedAmounts = (amount: number, rawAmounts: number[]): number[] => {
  const roundedAmounts = rawAmounts.map((value) => roundToTwoDecimals(value));
  let remainder = roundToTwoDecimals(
    amount - roundedAmounts.reduce((sum, value) => sum + value, 0),
  );

  const indexesByFraction = rawAmounts
    .map((value, index) => ({index, fraction: value * 100 - Math.floor(value * 100)}))
    .sort((a, b) => b.fraction - a.fraction)
    .map((item) => item.index);

  const adjustedAmounts = [...roundedAmounts];
  let cursor = 0;
  while (remainder > 0.0001 && indexesByFraction.length > 0) {
    const index = indexesByFraction[cursor % indexesByFraction.length];
    adjustedAmounts[index] = roundToTwoDecimals(adjustedAmounts[index] + 0.01);
    remainder = roundToTwoDecimals(remainder - 0.01);
    cursor += 1;
  }

  return adjustedAmounts;
};

export const generateGroupSplitDetails = (
  members: EnhancedGroupMember[],
  amount: number,
  method: GroupSplitMethod,
  provided?: SplitDetail[],
): SplitDetail[] => {
  const activeMembers = getActiveMembers(members);
  if (activeMembers.length === 0) return [];

  if (method === 'equal') {
    const splitAmount = roundToTwoDecimals(amount / activeMembers.length);
    let remainder = roundToTwoDecimals(amount - splitAmount * activeMembers.length);

    return activeMembers.map((member, index) => {
      let finalAmount = splitAmount;
      if (index === 0 && Math.abs(remainder) > 0) {
        finalAmount = roundToTwoDecimals(finalAmount + remainder);
      }

      return {
        memberId: member.id,
        memberName: member.name,
        amount: finalAmount,
        isPaid: false,
      };
    });
  }

  if (method === 'percentage') {
    const base =
      provided && provided.length > 0
        ? provided.filter((detail) => activeMembers.some((member) => member.id === detail.memberId))
        : activeMembers.map(
            (member) =>
              ({
                memberId: member.id,
                memberName: member.name,
                percentage: 100 / activeMembers.length,
              }) as SplitDetail,
          );

    const percentages = base.map((detail) => Math.max(0, detail.percentage || 0));
    const totalPercentage = percentages.reduce((sum, percentage) => sum + percentage, 0);
    const normalizedPercentages =
      totalPercentage > 0
        ? percentages.map((percentage) => (percentage / totalPercentage) * 100)
        : percentages;
    const adjustedAmounts = distributeRoundedAmounts(
      amount,
      normalizedPercentages.map((percentage) => (amount * percentage) / 100),
    );

    return base.map((detail, index) => ({
      memberId: detail.memberId,
      memberName: getMemberName(detail.memberId, detail.memberName, activeMembers),
      amount: adjustedAmounts[index],
      percentage: normalizedPercentages[index],
      isPaid: false,
    }));
  }

  if (method === 'shares') {
    const base =
      provided && provided.length > 0
        ? provided.filter((detail) => activeMembers.some((member) => member.id === detail.memberId))
        : activeMembers.map(
            (member) =>
              ({
                memberId: member.id,
                memberName: member.name,
                shares: 1,
              }) as SplitDetail,
          );

    const shares = base.map((detail) => Math.max(0, detail.shares || 0));
    const totalShares = shares.reduce((sum, share) => sum + share, 0);
    if (totalShares <= 0) {
      return activeMembers.map((member) => ({
        memberId: member.id,
        memberName: member.name,
        amount: 0,
        isPaid: false,
      }));
    }

    const adjustedAmounts = distributeRoundedAmounts(
      amount,
      shares.map((share) => (amount * share) / totalShares),
    );

    return base.map((detail, index) => ({
      memberId: detail.memberId,
      memberName: getMemberName(detail.memberId, detail.memberName, activeMembers),
      amount: adjustedAmounts[index],
      shares: shares[index],
      isPaid: false,
    }));
  }

  return [];
};

export const normalizeGroupSplitDetails = (
  members: EnhancedGroupMember[],
  totalAmount: number,
  splitMethod: GroupSplitMethod,
  provided?: SplitDetail[],
): SplitDetail[] => {
  const activeMembers = getActiveMembers(members);
  const memberMap = new Map(activeMembers.map((member) => [member.id, member]));

  const baseDetails: SplitDetail[] =
    provided && provided.length > 0
      ? provided.map((detail) => ({
          memberId: detail.memberId,
          memberName: detail.memberName || memberMap.get(detail.memberId)?.name || 'Unknown',
          amount: typeof detail.amount === 'number' ? detail.amount : 0,
          percentage: detail.percentage,
          shares: detail.shares,
          isPaid: detail.isPaid ?? false,
          settledAmount: detail.settledAmount,
          settledDate: detail.settledDate,
        }))
      : activeMembers.map((member) => ({
          memberId: member.id,
          memberName: member.name,
          amount: 0,
          isPaid: false,
        }));

  if (splitMethod === 'custom') {
    return baseDetails.map((detail) => ({...detail, amount: roundToTwoDecimals(detail.amount)}));
  }

  return generateGroupSplitDetails(members, totalAmount, splitMethod, provided).map((detail) => {
    const existing = baseDetails.find((baseDetail) => baseDetail.memberId === detail.memberId);
    return {
      ...detail,
      isPaid: existing?.isPaid ?? false,
      settledAmount: existing?.settledAmount,
      settledDate: existing?.settledDate,
    };
  });
};
