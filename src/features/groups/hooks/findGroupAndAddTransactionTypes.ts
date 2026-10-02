import type {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';
import type {MemberDebt} from '@/types';
import type {EnhancedGroup} from '@/features/groups/types';
import type {GroupSplitType, GroupTransactionType} from '../types/addGroupTransaction';

export interface SettlementPreviewDebt {
  id: string;
  description: string;
  originalAmount: number;
  outstandingAmount: number;
  settledAmount: number;
  creditor: string;
  date: string;
}

export interface SettlementPreview {
  payingMember: string;
  recipients: string[];
  debts: SettlementPreviewDebt[];
  totalOutstanding: number;
  settlementAmount: number;
  difference: number;
}

export interface UseFindGroupAndAddTransactionScreenResult {
  searchQuery: string;
  selectedGroup: EnhancedGroup | null;
  filteredGroups: EnhancedGroup[];
  description: string;
  amount: string;
  transactionType: GroupTransactionType;
  paidBy: string;
  receivedBy: string[];
  splitType: GroupSplitType;
  customAmounts: Record<string, string>;
  percentageAmounts: Record<string, string>;
  sharesAmounts: Record<string, string>;
  currencySymbol: string;
  isDarkMode: boolean;
  headerProps: ReturnType<typeof useProgressiveBlurHeader>['headerProps'];
  onScroll: ReturnType<typeof useProgressiveBlurHeader>['onScroll'];
  largeTitleStyle: ReturnType<typeof useProgressiveBlurHeader>['largeTitleStyle'];
  settlementPreview: SettlementPreview | null;
  settingsFormatCurrencyExact: (amount: number) => string;
  getMemberDebts: () => MemberDebt[];
  setSearchQuery: (value: string) => void;
  setSelectedGroup: (value: EnhancedGroup | null) => void;
  setDescription: (value: string) => void;
  setTransactionType: (value: GroupTransactionType) => void;
  setPaidBy: (value: string) => void;
  setSplitType: (value: GroupSplitType) => void;
  setCustomAmounts: (value: Record<string, string>) => void;
  setPercentageAmounts: (value: Record<string, string>) => void;
  setSharesAmounts: (value: Record<string, string>) => void;
  handleAmountChange: (text: string) => void;
  handleRecipientSelection: (memberId: string) => void;
  handleSelectGroup: (group: EnhancedGroup) => void;
  handleSubmit: () => Promise<void>;
  navigateBack: () => void;
}
