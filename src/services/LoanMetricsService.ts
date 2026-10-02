import {LoanData, PaymentRecord} from '../types/loan.types';
import {
  calculateLoanMetrics as calculateLoanMetricsWithDayjs,
  calculateNextPaymentDate,
} from '@/features/loans/calculations';
import dayjs from 'dayjs';

/**
 * Interface for comprehensive loan metrics
 */
export interface LoanMetrics {
  // Basic financial metrics
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  totalInterest: number;

  // Tenure metrics
  totalTenure: number;
  completedTenure: number;
  remainingTenure: number;

  // Dates
  startDate: string;
  maturityDate: string;
  nextEmiDate: string;

  // Progress tracking
  progressPercentage: number;
  isLoanCompleted: boolean;

  // Payment details
  emiAmount: number;
  paymentFrequency: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

  // Status
  status: 'ACTIVE' | 'CLOSED' | 'DEFAULTED';
}

/**
 * Centralized service for calculating loan metrics
 */
export class LoanMetricsService {
  /**
   * Calculate comprehensive loan metrics
   * @param loan The loan data
   * @returns Comprehensive loan metrics
   */
  static calculateLoanMetrics(loan: LoanData): LoanMetrics {
    // Use existing utility function for basic metrics
    const basicMetrics = calculateLoanMetricsWithDayjs(loan);

    // Calculate next EMI date based on payment frequency
    let nextEmiDate = loan.nextEmiDate;
    try {
      // Map loan payment frequency to utility frequency (WEEKLY not supported in utility)
      let utilityFrequency: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' = 'MONTHLY';
      switch (loan.paymentFrequency) {
        case 'MONTHLY':
          utilityFrequency = 'MONTHLY';
          break;
        case 'QUARTERLY':
          utilityFrequency = 'QUARTERLY';
          break;
        case 'YEARLY':
          utilityFrequency = 'YEARLY';
          break;
        case 'WEEKLY':
        default:
          utilityFrequency = 'MONTHLY';
          break;
      }

      // Calculate next payment date
      const nextPaymentDate = calculateNextPaymentDate(loan.nextEmiDate, 1, utilityFrequency);
      nextEmiDate = nextPaymentDate;
    } catch (error) {
      appLogger.warn('Error calculating next EMI date:', error);
    }

    return {
      // Basic financial metrics
      totalAmount: basicMetrics.totalAmount,
      paidAmount: basicMetrics.paidAmount,
      remainingAmount: basicMetrics.remainingAmount,
      totalInterest: loan.totalInterest || 0,

      // Tenure metrics
      totalTenure: loan.tenure,
      completedTenure: basicMetrics.completedTenure,
      remainingTenure: basicMetrics.remainingTenure,

      // Dates
      startDate: loan.startDate,
      maturityDate: basicMetrics.maturityDate,
      nextEmiDate: nextEmiDate,

      // Progress tracking
      progressPercentage: basicMetrics.progressPercentage,
      isLoanCompleted: basicMetrics.isLoanCompleted,

      // Payment details
      emiAmount: loan.emiAmount,
      paymentFrequency: loan.paymentFrequency,

      // Status
      status: loan.status,
    };
  }

  /**
   * Calculate payment history metrics
   * @param loan The loan data
   * @returns Payment history metrics
   */
  static calculatePaymentHistoryMetrics(loan: LoanData) {
    const paymentHistory = loan.paymentHistory || [];

    // Calculate total paid
    const totalPaid = paymentHistory
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);

    // Count payments by status
    const paidCount = paymentHistory.filter((p) => p.status === 'PAID').length;
    const pendingCount = paymentHistory.filter((p) => p.status === 'PENDING').length;
    const failedCount = paymentHistory.filter((p) => p.status === 'FAILED').length;

    // Calculate average payment amount
    const averagePayment = paidCount > 0 ? totalPaid / paidCount : 0;

    return {
      totalPaid,
      paidCount,
      pendingCount,
      failedCount,
      averagePayment,
      paymentHistory,
    };
  }

  /**
   * Get loan status summary
   * @param loan The loan data
   * @returns Loan status summary
   */
  static getLoanStatusSummary(loan: LoanData) {
    const metrics = this.calculateLoanMetrics(loan);
    const paymentMetrics = this.calculatePaymentHistoryMetrics(loan);

    return {
      status: loan.status,
      isOverdue: loan.status === 'ACTIVE' && dayjs(loan.nextEmiDate).isBefore(dayjs(), 'day'),
      isCompleted: metrics.isLoanCompleted,
      paymentsMade: paymentMetrics.paidCount,
      totalPayments: loan.tenure,
      paymentsRemaining: metrics.remainingTenure,
    };
  }

  /**
   * Calculate loan insights
   * @param loan The loan data
   * @returns Loan insights
   */
  static calculateLoanInsights(loan: LoanData) {
    const metrics = this.calculateLoanMetrics(loan);
    const paymentMetrics = this.calculatePaymentHistoryMetrics(loan);

    // Calculate monthly payment burden
    const monthlyBurden = (loan.emiAmount / (loan.principalAmount / loan.tenure)) * 100;

    // Calculate interest ratio
    const interestRatio = (loan.totalInterest / loan.principalAmount) * 100;

    return {
      monthlyBurdenPercentage: monthlyBurden,
      interestToPrincipalRatio: interestRatio,
      averagePaymentAmount: paymentMetrics.averagePayment,
      onTimePaymentRate:
        paymentMetrics.paidCount > 0
          ? (paymentMetrics.paidCount / (paymentMetrics.paidCount + paymentMetrics.failedCount)) *
            100
          : 0,
    };
  }
}
