import type {ComponentProps} from 'react';
import type {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import type {Category, Group, GroupMember, MemberDebt} from '@/types';

export type GroupTransactionType = 'expense' | 'payment';
export type GroupSplitType = 'equal' | 'custom' | 'percentage' | 'shares';
export type IoniconName = ComponentProps<typeof Ionicons>['name'];

export interface GroupMemberWithAvatarUrl extends GroupMember {
  avatarUrl?: string;
}

export interface GroupWithAvatarMembers extends Group {
  members: GroupMemberWithAvatarUrl[];
}

export interface GroupMemberBalanceViewModel {
  memberId: string;
  memberName: string;
  balance: number;
  totalPaid: number;
  totalOwed: number;
  percentageOfTotalExpenses: number;
  outstandingDebts: MemberDebt[];
  creditedAmounts: MemberDebt[];
}

export interface GroupBalanceViewModel {
  memberBalances: GroupMemberBalanceViewModel[];
  totalExpenses: number;
  totalPayments: number;
}

export interface AddGroupTransactionCategory extends Category {
  icon: string;
  color: string;
}

export const isIoniconName = (name: string | undefined): name is IoniconName => Boolean(name);
