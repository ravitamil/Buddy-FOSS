import type {Category, InvestmentCategory, SpendingLimit} from './category.types';
import type {Group} from './group.types';
import type {Investment, Portfolio} from './investment.types';
import type {SavingsGoal} from './savings.types';
import type {
  RecurringTransaction,
  RecurringTransactionTemplate,
  Transaction,
} from './transaction.types';

export interface AppState {
  transactions: Transaction[];
  categories: Category[];
  spendingLimits: SpendingLimit[];
  savingsGoals: SavingsGoal[];
  groups: Group[];
  investments: Investment[];
  investmentCategories: InvestmentCategory[];
  portfolios: Portfolio[];
  recurringTransactions: RecurringTransaction[];
  recurringTransactionTemplates: RecurringTransactionTemplate[];
  currentUser: {
    id: string;
    name: string;
    email: string;
  };
}
