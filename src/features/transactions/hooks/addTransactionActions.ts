import type {RecurrenceFrequency, Transaction} from '@/types';
import type {AddTransactionRouteType, RecurringTransactionTemplateResult} from '../types';
import {buildTransactionInput} from './addTransactionScreenModelUtils';

interface SaveAddTransactionInput {
  parsedAmount: number;
  description: string;
  selectedCategoryName?: string;
  selectedCategoryId?: string;
  selectedWalletId?: string;
  fallbackCategoryName?: string;
  transactionType: AddTransactionRouteType;
  selectedDate: Date;
  isIncome: boolean;
  isEditMode: boolean;
  editId?: string;
  isRecurring: boolean;
  recurrenceFrequency: RecurrenceFrequency;
  recurrenceEndDate: Date | null;
}

interface AlertConfig {
  title: string;
  message: string;
  actions: Array<{text: string; onPress?: () => void}>;
}

interface SaveAddTransactionDependencies {
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<unknown>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<unknown>;
  createRecurringTransaction: (
    transaction: Omit<Transaction, 'id'>,
  ) => Promise<RecurringTransactionTemplateResult>;
  formatCurrency: (amount: number) => string;
  showAlert: (config: AlertConfig) => void;
  goBack: () => void;
  logError: (message: string, error: unknown) => void;
}

export const saveAddTransaction = async (
  input: SaveAddTransactionInput,
  dependencies: SaveAddTransactionDependencies,
): Promise<void> => {
  const transactionInput = buildTransactionInput(input);
  const transactionLabel = input.isIncome ? 'Income' : 'Expense';

  try {
    if (input.isEditMode && input.editId) {
      await dependencies.updateTransaction(input.editId, {
        ...transactionInput,
        lastModified: new Date(),
      });
      showSuccessAlert(
        `${transactionLabel} of ${dependencies.formatCurrency(
          input.parsedAmount,
        )} has been updated successfully!`,
        dependencies,
      );
      return;
    }

    const newTransaction: Omit<Transaction, 'id'> = {
      ...transactionInput,
      isRecurring: false,
    };

    if (input.isRecurring) {
      const template = await createRecurringTemplate(input, transactionInput, dependencies);
      Object.assign(newTransaction, {
        isRecurring: true,
        parentRecurringId: template.id,
        recurrenceFrequency: input.recurrenceFrequency,
        recurrenceEndDate: input.recurrenceEndDate?.toISOString(),
        nextOccurrenceDate: template.nextOccurrenceDate,
      });
    }

    await dependencies.addTransaction(newTransaction);
    showSuccessAlert(
      `${transactionLabel} of ${dependencies.formatCurrency(
        input.parsedAmount,
      )} has been added successfully!`,
      dependencies,
    );
  } catch (error) {
    dependencies.logError('Failed to save transaction', error);
    dependencies.showAlert({
      title: 'Error',
      message: `Failed to ${input.isEditMode ? 'update' : 'save'} transaction. Please try again.`,
      actions: [{text: 'OK'}],
    });
  }
};

const createRecurringTemplate = async (
  input: SaveAddTransactionInput,
  transactionInput: Omit<Transaction, 'id' | 'isRecurring'>,
  dependencies: SaveAddTransactionDependencies,
): Promise<RecurringTransactionTemplateResult> => {
  try {
    return await dependencies.createRecurringTransaction({
      ...transactionInput,
      amount: input.parsedAmount,
    });
  } catch (error) {
    dependencies.logError('Error creating recurring template:', error);
    throw new Error('Failed to create recurring transaction template');
  }
};

const showSuccessAlert = (message: string, dependencies: SaveAddTransactionDependencies): void => {
  dependencies.showAlert({
    title: 'Success',
    message,
    actions: [{text: 'OK', onPress: dependencies.goBack}],
  });
};
