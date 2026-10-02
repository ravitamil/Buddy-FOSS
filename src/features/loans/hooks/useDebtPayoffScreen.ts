import {useCallback, useMemo, useState} from 'react';
import {router} from 'expo-router';
import {getCurrencySymbol} from '@/constants/currencies';
import {useLoanQuery as useLoan} from '@/context/LoanContext.query';
import {useSettings} from '@/context/SettingsContext';
import type {EnhancedLoan} from '@/context/LoanContext.query';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {useAlert} from '@/hooks/useAlert';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';
import {DebtPayoffService} from '@/services/DebtPayoffService';
import {logger as appLogger} from '@/services/LoggerService';
import type {DebtPayoffPlan, DebtPayoffStrategy} from '@/types/debt.types';
import type {LoanData} from '@/types/loan.types';

const logger = appLogger.contextLogger('DebtPayoffScreen');

export interface DebtPayoffChartDatum {
  value: number;
  color: string;
  label: string;
  text: string;
}

export interface DebtPayoffScreenState {
  activeLoans: LoanData[];
  chartData: DebtPayoffChartDatum[];
  currencySymbol: string;
  customOrder: string[];
  debtPayoffPlan: DebtPayoffPlan | null;
  extraPayment: number;
  formatCurrency: (amount: number) => string;
  headerProps: ReturnType<typeof useProgressiveBlurHeader>['headerProps'];
  isDarkMode: boolean;
  isGenerating: boolean;
  lastSyncStatus: 'synced' | 'pending' | 'error';
  onScroll: ReturnType<typeof useProgressiveBlurHeader>['onScroll'];
  selectedStrategy: DebtPayoffStrategy;
  handleAddLoan: () => void;
  handleApplyStrategy: () => void;
  handleBack: () => void;
  setExtraPayment: (value: number) => void;
  setSelectedStrategy: (strategy: DebtPayoffStrategy) => void;
}

const PAYOFF_CHART_COLORS = [
  '#FF5722',
  '#2196F3',
  '#9C27B0',
  '#FF9800',
  '#E91E63',
  '#4CAF50',
  '#00BCD4',
  '#795548',
];

const dateToIso = (date: Date | string | undefined): string | undefined => {
  if (!date) return undefined;
  return typeof date === 'string' ? date : date.toISOString();
};

const mapLoanToLoanData = (loan: EnhancedLoan): LoanData => ({
  ...loan,
  startDate: dateToIso(loan.startDate) ?? new Date().toISOString(),
  nextEmiDate: dateToIso(loan.nextEmiDate) ?? new Date().toISOString(),
  disbursementDate: dateToIso(loan.disbursementDate),
  sanctionDate: dateToIso(loan.sanctionDate),
  firstEmiDate: dateToIso(loan.firstEmiDate),
  createdAt: dateToIso(loan.createdAt) ?? new Date().toISOString(),
  updatedAt: dateToIso(loan.updatedAt) ?? new Date().toISOString(),
  projectedPayoffDate: dateToIso(loan.projectedPayoffDate),
  paymentFrequency: loan.paymentFrequency ?? 'MONTHLY',
});

const calculatePlanForStrategy = (
  payoffService: DebtPayoffService,
  strategy: DebtPayoffStrategy,
  loans: LoanData[],
  customOrder: string[],
): DebtPayoffPlan => {
  switch (strategy) {
    case 'avalanche':
      return payoffService.calculateAvalancheStrategy(loans);
    case 'snowflake':
      return payoffService.calculateSnowflakeStrategy(loans);
    case 'custom':
      return payoffService.calculateCustomStrategy(loans, customOrder);
    case 'snowball':
    default:
      return payoffService.calculateSnowballStrategy(loans);
  }
};

const applyExtraPaymentMetrics = (
  payoffService: DebtPayoffService,
  plan: DebtPayoffPlan,
  activeLoans: LoanData[],
  extraPayment: number,
): DebtPayoffPlan => {
  if (extraPayment <= 0 || plan.loans.length === 0) {
    return plan;
  }

  const orderedLoans = plan.loans
    .map((planLoan) => activeLoans.find((loan) => loan.id === planLoan.id))
    .filter((loan): loan is LoanData => loan !== undefined);

  const schedule = payoffService.optimizePaymentSchedule(orderedLoans, extraPayment, true);
  const perLoanInterestPaid: Record<string, number> = {};
  const perLoanPayoffDate: Record<string, string> = {};

  for (const entry of schedule.schedule) {
    for (const detail of entry.loans) {
      perLoanInterestPaid[detail.loanId] =
        (perLoanInterestPaid[detail.loanId] ?? 0) + detail.interest;
      if (detail.isPaidOff && !perLoanPayoffDate[detail.loanId]) {
        perLoanPayoffDate[detail.loanId] = entry.date;
      }
    }
  }

  const loansWithMetrics = plan.loans.map((planLoan, index) => {
    const originalLoan = activeLoans.find((loan) => loan.id === planLoan.id);
    const interestPaid = perLoanInterestPaid[planLoan.id] ?? 0;
    const originalTotalInterest = originalLoan?.totalInterest ?? 0;

    return {
      ...planLoan,
      extraPayment,
      payoffOrder: planLoan.payoffOrder ?? index + 1,
      interestSavings: Math.max(0, originalTotalInterest - interestPaid),
      projectedPayoffDate: perLoanPayoffDate[planLoan.id] ?? planLoan.projectedPayoffDate,
    };
  });

  return {
    ...plan,
    loans: loansWithMetrics,
    totalInterestSavings: plan.loans.reduce((sum, planLoan) => {
      const originalLoan = activeLoans.find((loan) => loan.id === planLoan.id);
      const interestPaid = perLoanInterestPaid[planLoan.id] ?? 0;
      const originalTotalInterest = originalLoan?.totalInterest ?? 0;
      return sum + Math.max(0, originalTotalInterest - interestPaid);
    }, 0),
    yearsToPayoff: schedule.totalMonths / 12,
  };
};

export function useDebtPayoffScreen(): DebtPayoffScreenState {
  const {formatCurrency, currency} = useSettings();
  const loanContext = useLoan();
  const {showAlert} = useAlert();
  const {isDarkMode} = useTamaguiTheme();
  const {onScroll, headerProps} = useProgressiveBlurHeader();
  const payoffService = useMemo(() => new DebtPayoffService(), []);

  const [selectedStrategy, setSelectedStrategy] = useState<DebtPayoffStrategy>('snowball');
  const [customOrder] = useState<string[]>([]);
  const [extraPayment, setExtraPayment] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const activeLoans = useMemo(
    () => loanContext.loans.items.filter((loan) => loan.status === 'ACTIVE').map(mapLoanToLoanData),
    [loanContext.loans.items],
  );

  const debtPayoffPlan = useMemo(() => {
    if (activeLoans.length === 0) return null;

    try {
      const plan = calculatePlanForStrategy(
        payoffService,
        selectedStrategy,
        activeLoans,
        customOrder,
      );
      return applyExtraPaymentMetrics(payoffService, plan, activeLoans, extraPayment);
    } catch (error) {
      logger.warn('Failed to calculate debt payoff plan for UI', error);
      return null;
    }
  }, [activeLoans, customOrder, extraPayment, payoffService, selectedStrategy]);

  const chartData = useMemo<DebtPayoffChartDatum[]>(() => {
    if (!debtPayoffPlan) return [];

    return debtPayoffPlan.loans.map((loan, index) => ({
      value: loan.balance,
      color: PAYOFF_CHART_COLORS[index % PAYOFF_CHART_COLORS.length],
      label: loan.name,
      text: loan.name,
    }));
  }, [debtPayoffPlan]);

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  const handleAddLoan = useCallback(() => {
    router.push('/add-edit-loan');
  }, []);

  const handleApplyStrategy = useCallback(() => {
    if (isGenerating) return;

    void (async () => {
      setIsGenerating(true);

      try {
        const basePlan = calculatePlanForStrategy(
          payoffService,
          selectedStrategy,
          activeLoans,
          customOrder,
        );
        const plan = applyExtraPaymentMetrics(payoffService, basePlan, activeLoans, extraPayment);

        for (const planLoan of plan.loans) {
          try {
            const updates: Partial<EnhancedLoan> = {
              payoffStrategy: selectedStrategy,
              extraPaymentAllocation: extraPayment,
              projectedPayoffDate: planLoan.projectedPayoffDate
                ? new Date(planLoan.projectedPayoffDate)
                : undefined,
              interestSavings: planLoan.interestSavings,
              customPayoffOrder: planLoan.payoffOrder,
            };

            await loanContext.loans.update(planLoan.id, updates);
          } catch (error) {
            logger.warn('Failed to update loan with payoff metrics', {
              loanId: planLoan.id,
              error,
            });
          }
        }

        showAlert({
          title: 'Strategy Applied',
          message:
            `Your debt payoff strategy has been generated and saved.\n\n` +
            `Estimated payoff time: ${plan.yearsToPayoff.toFixed(1)} years\n` +
            `Estimated interest savings: ${formatCurrency(plan.totalInterestSavings)}`,
          actions: [{text: 'OK'}],
        });
      } catch (error) {
        logger.error('Error applying strategy:', error);
        showAlert({
          title: 'Error',
          message: 'Failed to generate and save your debt payoff strategy. Please try again.',
          actions: [{text: 'OK'}],
        });
      } finally {
        setIsGenerating(false);
      }
    })();
  }, [
    activeLoans,
    customOrder,
    extraPayment,
    formatCurrency,
    isGenerating,
    loanContext.loans,
    payoffService,
    selectedStrategy,
    showAlert,
  ]);

  return {
    activeLoans,
    chartData,
    currencySymbol: getCurrencySymbol(currency),
    customOrder,
    debtPayoffPlan,
    extraPayment,
    formatCurrency,
    headerProps,
    isDarkMode,
    isGenerating,
    lastSyncStatus: 'synced',
    onScroll,
    selectedStrategy,
    handleAddLoan,
    handleApplyStrategy,
    handleBack,
    setExtraPayment,
    setSelectedStrategy,
  };
}
