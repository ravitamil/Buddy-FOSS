import type {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import type {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';
import type {SubscriptionData} from '@/types/finance.types';
import type {PaymentRecord} from '@/types/loan.types';

export interface SubscriptionDetailAnalyticsViewModel {
  totalPaid: number;
  avgPayment: number;
  yearlyCost: number;
  daysUntilNext: number;
  paymentCount: number;
}

export interface SubscriptionPaymentDraft {
  amount: string;
  date: Date;
}

export interface UseSubscriptionDetailScreenResult {
  subscriptionId: string;
  subscription: SubscriptionData | null;
  loading: boolean;
  isDarkMode: boolean;
  currency: string;
  formatCurrency: (amount: number) => string;
  headerProps: ReturnType<typeof useProgressiveBlurHeader>['headerProps'];
  onScroll: ReturnType<typeof useProgressiveBlurHeader>['onScroll'];
  showPaymentHistory: boolean;
  setShowPaymentHistory: (show: boolean) => void;
  showPaymentSheet: boolean;
  setShowPaymentSheet: (show: boolean) => void;
  showEditSheet: boolean;
  setShowEditSheet: (show: boolean) => void;
  showOptionsSheet: boolean;
  setShowOptionsSheet: (show: boolean) => void;
  showPaymentDatePicker: boolean;
  setShowPaymentDatePicker: (show: boolean) => void;
  editingPayment: PaymentRecord | null;
  selectedPayment: PaymentRecord | null;
  paymentDraft: SubscriptionPaymentDraft;
  analytics: SubscriptionDetailAnalyticsViewModel | null;
  handleBack: () => void;
  handleEdit: () => void;
  handleShare: () => void;
  handlePauseResume: () => void;
  handleMarkAsPaid: () => void;
  handleConfirmPayment: () => Promise<void>;
  handlePaymentDateChange: (event: DateTimePickerEvent, selectedDate?: Date) => void;
  handlePaymentAction: (payment: PaymentRecord) => void;
  handleEditPayment: () => void;
  handleDeletePayment: () => void;
  handleDeleteSubscription: () => void;
  handleWebsitePress: () => void;
  setPaymentAmount: (amount: string) => void;
  resetEditSheet: (open: boolean) => void;
  resetOptionsSheet: (open: boolean) => void;
}
