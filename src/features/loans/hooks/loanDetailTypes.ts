import type {ComponentProps} from 'react';
import type {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import type {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';
import type {LoanData} from '@/types/loan.types';

export type IoniconName = ComponentProps<typeof Ionicons>['name'];

export interface LoanInstallmentDetail {
  installmentNumber: number;
  dueDate: Date;
  amount: number;
  principalAmount: number;
  interestAmount: number;
  outstandingBalance: number;
  isPaid: boolean;
  paidDate?: Date;
  status: 'paid' | 'overdue' | 'upcoming';
}

export interface LoanDetailMetricsViewModel {
  maturityDate: Date;
  maturityDateText: string;
  progressPercentage: number;
  completedTenure: number;
  remainingTenure: number;
  amountLeft: number;
  paidAmount: number;
  totalAmount: number;
  isLoanCompleted: boolean;
  nextEmiDate: Date;
  totalInterestPaid: number;
  loanColor: string;
  loanIcon: IoniconName;
}

export interface AdditionalPaymentState {
  visible: boolean;
  amount: string;
  error: string | null;
}

export interface UseLoanDetailScreenResult {
  loan: LoanData | null;
  loanId: string;
  availableLoanCount: number;
  loadingTimeout: boolean;
  showPaymentHistory: boolean;
  showDeleteModal: boolean;
  selectedInstallment: LoanInstallmentDetail | null;
  showInstallmentModal: boolean;
  additionalPayment: AdditionalPaymentState;
  buttonText: string;
  hasMarkedPaid: boolean;
  metrics: LoanDetailMetricsViewModel | null;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date) => string;
  onScroll: ReturnType<typeof useProgressiveBlurHeader>['onScroll'];
  headerProps: ReturnType<typeof useProgressiveBlurHeader>['headerProps'];
  handleGoBack: () => void;
  handleRetry: () => void;
  handleEditLoan: () => void;
  handleDeleteLoan: () => void;
  confirmDeleteLoan: () => Promise<void>;
  cancelDeleteLoan: () => void;
  handleRecordPayment: () => void;
  handleInstallmentPress: (installmentNumber: number) => void;
  setShowPaymentHistory: (show: boolean) => void;
  closeInstallmentModal: () => void;
  setAdditionalPaymentAmount: (amount: string) => void;
  closeAdditionalPaymentModal: () => void;
  submitAdditionalPayment: () => Promise<void>;
  showPrepaymentComingSoon: () => void;
}
