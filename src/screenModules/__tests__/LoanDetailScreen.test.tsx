import React from 'react';
import {render} from '@testing-library/react-native';
import {TamaguiProvider} from 'tamagui';
import config from '../../../tamagui.config';
import LoanDetailScreen from '../LoanDetailScreen';
import {useLoanDetailScreen} from '@/features/loans/hooks/useLoanDetailScreen';
import type {UseLoanDetailScreenResult} from '@/features/loans/hooks/loanDetailTypes';

jest.mock('@/features/loans/hooks/useLoanDetailScreen', () => ({
  useLoanDetailScreen: jest.fn(),
}));

jest.mock('@/context/TamaguiThemeProvider', () => ({
  useTamaguiTheme: () => ({
    isDarkMode: true,
    theme: 'dark',
    toggleTheme: jest.fn(),
  }),
}));

jest.mock('@/components/ui/CustomNavigationHeader', () => ({
  CustomNavigationHeader: () => null,
}));

jest.mock('@/components/ui/ScreenContainer', () => ({
  __esModule: true,
  default: ({children}: {children?: React.ReactNode}) => children,
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
}));

const mockUseLoanDetailScreen = useLoanDetailScreen as jest.MockedFunction<
  typeof useLoanDetailScreen
>;

function renderWithTamagui(ui: React.ReactElement) {
  return render(
    <TamaguiProvider config={config} defaultTheme="dark">
      {ui}
    </TamaguiProvider>,
  );
}

describe('LoanDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state without error', () => {
    mockUseLoanDetailScreen.mockReturnValue({
      loan: null,
      loanId: 'test-loan-id',
      availableLoanCount: 0,
      loadingTimeout: false,
      showPaymentHistory: false,
      showDeleteModal: false,
      selectedInstallment: null,
      showInstallmentModal: false,
      additionalPayment: {visible: false, amount: '', error: null, installmentId: null},
      buttonText: 'Mark Paid',
      hasMarkedPaid: false,
      metrics: null,
      formatCurrency: (amount: number) => `$${amount}`,
      formatDate: () => '01/01/2026',
      onScroll: () => {},
      headerProps: {
        scrollY: {value: 0},
        enableProgressiveBlur: true,
        headerHeight: 75,
        showBackButtonInNonBlur: true,
      } as unknown as UseLoanDetailScreenResult['headerProps'],
      handleGoBack: jest.fn(),
      handleRetry: jest.fn(),
      handleEditLoan: jest.fn(),
      handleDeleteLoan: jest.fn(),
      confirmDeleteLoan: jest.fn(),
      cancelDeleteLoan: jest.fn(),
      handleRecordPayment: jest.fn(),
      handleInstallmentPress: jest.fn(),
      setShowPaymentHistory: jest.fn(),
      closeInstallmentModal: jest.fn(),
      setAdditionalPaymentAmount: jest.fn(),
      closeAdditionalPaymentModal: jest.fn(),
      submitAdditionalPayment: jest.fn(),
      showPrepaymentComingSoon: jest.fn(),
    });

    const {getByText} = renderWithTamagui(<LoanDetailScreen loanId="test-loan-id" />);
    expect(getByText('Loading loan details...')).toBeTruthy();
  });

  it('renders active loan details with reanimated scroll handler without TypeError', () => {
    const mockLoan = {
      id: 'test-loan-id',
      userId: 'user-1',
      name: 'Personal Loan',
      lenderName: 'HDFC Bank',
      loanType: 'PERSONAL' as const,
      principalAmount: 100000,
      interestRate: 12,
      tenure: 12,
      emiAmount: 8885,
      startDate: '2026-01-01',
      nextEmiDate: '2026-10-01',
      status: 'ACTIVE' as const,
      currency: 'INR',
      paymentHistory: [],
      totalAmount: 106620,
      totalInterest: 6620,
      currentOutstanding: 80000,
      outstandingBalance: 80000,
      amortizationSchedule: [],
      reminderEnabled: true,
      autoPayEnabled: false,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    };

    const mockMetrics = {
      maturityDate: new Date('2027-01-01'),
      maturityDateText: '2027-01-01',
      progressPercentage: 25,
      completedTenure: 3,
      remainingTenure: 9,
      amountLeft: 80000,
      paidAmount: 26620,
      totalAmount: 106620,
      isLoanCompleted: false,
      nextEmiDate: new Date('2026-10-01'),
      totalInterestPaid: 1500,
      loanColor: '#3B82F6',
      loanIcon: 'card-outline',
    };

    // Reanimated Worklet handler object (NOT a plain function)
    const workletScrollHandler = {
      worklet: () => {},
      listeners: {},
      eventNames: ['onScroll'],
    } as unknown as UseLoanDetailScreenResult['onScroll'];

    mockUseLoanDetailScreen.mockReturnValue({
      loan: mockLoan,
      loanId: 'test-loan-id',
      availableLoanCount: 1,
      loadingTimeout: false,
      showPaymentHistory: false,
      showDeleteModal: false,
      selectedInstallment: null,
      showInstallmentModal: false,
      additionalPayment: {visible: false, amount: '', error: null, installmentId: null},
      buttonText: 'Mark Paid',
      hasMarkedPaid: false,
      metrics: mockMetrics,
      formatCurrency: (amount: number) => `₹${amount.toLocaleString()}`,
      formatDate: () => '01/10/2026',
      onScroll: workletScrollHandler,
      headerProps: {
        scrollY: {value: 0},
        enableProgressiveBlur: true,
        headerHeight: 75,
        showBackButtonInNonBlur: true,
      } as unknown as UseLoanDetailScreenResult['headerProps'],
      handleGoBack: jest.fn(),
      handleRetry: jest.fn(),
      handleEditLoan: jest.fn(),
      handleDeleteLoan: jest.fn(),
      confirmDeleteLoan: jest.fn(),
      cancelDeleteLoan: jest.fn(),
      handleRecordPayment: jest.fn(),
      handleInstallmentPress: jest.fn(),
      setShowPaymentHistory: jest.fn(),
      closeInstallmentModal: jest.fn(),
      setAdditionalPaymentAmount: jest.fn(),
      closeAdditionalPaymentModal: jest.fn(),
      submitAdditionalPayment: jest.fn(),
      showPrepaymentComingSoon: jest.fn(),
    } as unknown as UseLoanDetailScreenResult);

    const {getAllByText, getByText} = renderWithTamagui(<LoanDetailScreen loanId="test-loan-id" />);
    expect(getAllByText('Personal Loan').length).toBeGreaterThan(0);
    expect(getByText('Quick Actions')).toBeTruthy();
  });
});
