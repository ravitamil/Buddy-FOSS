import type {GroupSplitType} from '../types/addGroupTransaction';
import type {SplitDetail} from '@/types';

const fallbackCategoryId = 'exp_other_3779e3ea-08fc-4109-924f-c796d81f2c32';

export const getFirstValidationError = (errors: Record<string, unknown>): string =>
  Object.values(errors).find(
    (value): value is string => typeof value === 'string' && value.length > 0,
  ) ?? 'Please check the highlighted fields.';

export const getSafeCategoryId = (selectedCategoryId: string): string =>
  selectedCategoryId === 'uncategorized' || !selectedCategoryId
    ? fallbackCategoryId
    : selectedCategoryId;

interface SplitSources {
  custom: Record<string, string>;
  percentage: Record<string, string>;
  shares: Record<string, string>;
}

export const parseSplitDetails = (
  splitType: GroupSplitType,
  sources: SplitSources,
): Record<string, number> => {
  const source =
    splitType === 'custom'
      ? sources.custom
      : splitType === 'percentage'
        ? sources.percentage
        : splitType === 'shares'
          ? sources.shares
          : {};
  return Object.fromEntries(
    Object.entries(source).map(([memberId, value]) => [memberId, Number.parseFloat(value) || 0]),
  );
};

interface SplitDetailInput {
  members: Array<{id: string; name: string}>;
  paidBy: string;
  splitAmounts: Record<string, number>;
  totalAmount: number;
  splitType?: GroupSplitType;
  sharesAmounts?: Record<string, string>;
  percentageAmounts?: Record<string, string>;
  now?: Date;
}

export const buildSplitDetailEntries = ({
  members,
  paidBy,
  splitAmounts,
  totalAmount,
  splitType = 'equal',
  sharesAmounts,
  percentageAmounts,
  now = new Date(),
}: SplitDetailInput): SplitDetail[] =>
  Object.entries(splitAmounts).map(([memberId, amount]) => {
    const isPaid = memberId === paidBy;
    const detail: SplitDetail = {
      memberId,
      memberName: members.find((member) => member.id === memberId)?.name || 'Unknown',
      amount,
      percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
      isPaid,
      settledAmount: isPaid ? amount : 0,
      settledDate: isPaid ? now : undefined,
    };

    if (splitType === 'shares' && sharesAmounts) {
      detail.shares = Number.parseFloat(sharesAmounts[memberId] ?? '1') || 1;
    } else if (splitType === 'percentage' && percentageAmounts) {
      detail.percentage = Number.parseFloat(percentageAmounts[memberId] ?? '0') || 0;
    }

    return detail;
  });
