import type {LoanData} from '@/types/loan.types';
import type {LoanDetailMetricsViewModel} from '../../hooks/useLoanDetailScreen';

export type FormatCurrency = (amount: number) => string;
export type FormatDate = (date: Date) => string;

export interface LoanDetailSectionProps {
  loan: LoanData;
  metrics: LoanDetailMetricsViewModel;
  formatCurrency: FormatCurrency;
  formatDate: FormatDate;
  buttonText: string;
  hasMarkedPaid: boolean;
  showPaymentHistory: boolean;
  onRecordPayment: () => void;
  onPrepayment: () => void;
  onDeleteLoan: () => void;
  onTogglePaymentHistory: (show: boolean) => void;
  onInstallmentPress: (installmentNumber: number) => void;
}
