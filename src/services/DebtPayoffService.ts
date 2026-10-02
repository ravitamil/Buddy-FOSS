import type {DebtPayoffPlan, PaymentSchedule} from '../types/debt.types';
import type {LoanData} from '../types/loan.types';
import {
  calculatePayoffPlan,
  optimizePaymentSchedule as optimizePaymentScheduleForLoans,
} from './debtPayoff/debtPayoffCalculations';
import {
  createDebtPayoffPlanWithSync,
  type DebtPayoffPlanWithSync,
  resolveDebtPayoffSyncConflict,
  type SyncStatus,
  updateDebtPayoffSyncStatus,
} from './debtPayoff/debtPayoffSync';
import {
  sortActiveLoansByAvalanche,
  sortActiveLoansByCustomOrder,
  sortActiveLoansBySnowball,
  sortActiveLoansBySnowflake,
} from './debtPayoff/debtPayoffStrategies';

export type {DebtPayoffPlanWithSync, SyncStatus};

export class DebtPayoffService {
  calculateSnowballStrategy(loans: LoanData[]): DebtPayoffPlan {
    return calculatePayoffPlan(sortActiveLoansBySnowball(loans), 'snowball');
  }

  calculateAvalancheStrategy(loans: LoanData[]): DebtPayoffPlan {
    return calculatePayoffPlan(sortActiveLoansByAvalanche(loans), 'avalanche');
  }

  calculateSnowflakeStrategy(loans: LoanData[]): DebtPayoffPlan {
    return calculatePayoffPlan(sortActiveLoansBySnowflake(loans), 'snowflake');
  }

  calculateCustomStrategy(loans: LoanData[], customOrder: string[]): DebtPayoffPlan {
    return calculatePayoffPlan(sortActiveLoansByCustomOrder(loans, customOrder), 'custom');
  }

  optimizePaymentSchedule(
    loans: LoanData[],
    extraPayment: number,
    respectOrder: boolean = false,
  ): PaymentSchedule {
    return optimizePaymentScheduleForLoans(loans, extraPayment, respectOrder);
  }

  createDebtPayoffPlanWithSync(
    plan: DebtPayoffPlan,
    userId: string,
    customId?: string,
  ): DebtPayoffPlanWithSync {
    return createDebtPayoffPlanWithSync(plan, userId, customId);
  }

  updateSyncStatus(
    plan: DebtPayoffPlanWithSync,
    status: SyncStatus,
    cloudVersion?: number,
  ): DebtPayoffPlanWithSync {
    return updateDebtPayoffSyncStatus(plan, status, cloudVersion);
  }

  resolveSyncConflict(
    localPlan: DebtPayoffPlanWithSync,
    cloudPlan: DebtPayoffPlanWithSync,
  ): DebtPayoffPlanWithSync {
    return resolveDebtPayoffSyncConflict(localPlan, cloudPlan);
  }
}
