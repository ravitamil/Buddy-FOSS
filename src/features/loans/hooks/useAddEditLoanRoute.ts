import {useCallback, useEffect, useState} from 'react';
import {useRouter} from 'expo-router';

import {useLoanQuery as useLoan} from '@/context/LoanContext.query';
import {useToast} from '@/context/ToastContext';
import {logger as appLogger} from '@/services/LoggerService';
import type {LoanFormData} from '@/types/loan.types';
import {toLoanDraft, toLoanFormData} from './loanRouteMappers';

export function useAddEditLoanRoute(loanId?: string) {
  const router = useRouter();
  const {loans} = useLoan();
  const {showToast} = useToast();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<Partial<LoanFormData>>({});
  useEffect(() => {
    if (!loanId) return;

    const loan = loans.items.find((item) => item.id === loanId);
    if (loan) {
      setInitialData(toLoanFormData(loan));
      return;
    }

    if (!loans.isLoading) {
      appLogger.warn('Loan not found for edit route', {loanId});
      showToast({type: 'error', title: 'Loan not found'});
    }
  }, [loanId, loans.isLoading, loans.items, showToast]);

  const handleSubmit = useCallback(
    async (data: LoanFormData) => {
      try {
        setLoading(true);
        const draft = toLoanDraft(data);
        if (loanId) {
          await loans.update(loanId, draft);
          showToast({type: 'success', title: 'Loan updated successfully'});
        } else {
          await loans.add(draft);
          showToast({type: 'success', title: 'Loan created successfully'});
        }
        router.back();
      } catch (error) {
        appLogger.error('Failed to save loan', error, {loanId, isEditing: Boolean(loanId)});
        showToast({type: 'error', title: 'Failed to save loan. Please try again.'});
      } finally {
        setLoading(false);
      }
    },
    [loanId, loans, router, showToast],
  );

  return {
    initialData,
    loading,
    isEditing: Boolean(loanId),
    handleSubmit,
    handleCancel: router.back,
  };
}
