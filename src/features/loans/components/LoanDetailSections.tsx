import React from 'react';
import {LoanAnalyticsSection, LoanAutomationSection} from './LoanDetailAnalyticsSections';
import {LoanChargesSection, LoanDetailsSection} from './LoanDetailInfoSections';
import {LoanPaymentHistorySection, LoanPaymentProgressSection} from './LoanDetailPaymentSections';
import {LoanQuickActionsSection, LoanSummarySection} from './loanDetail/LoanDetailOverviewSections';
import type {LoanDetailSectionProps} from './loanDetail/loanDetailSectionTypes';

export function LoanDetailSections({
  loan,
  metrics,
  formatCurrency,
  formatDate,
  buttonText,
  hasMarkedPaid,
  showPaymentHistory,
  onRecordPayment,
  onPrepayment,
  onDeleteLoan,
  onTogglePaymentHistory,
  onInstallmentPress,
}: LoanDetailSectionProps) {
  return (
    <>
      <LoanSummarySection
        loan={loan}
        metrics={metrics}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />
      <LoanQuickActionsSection
        loan={loan}
        buttonText={buttonText}
        hasMarkedPaid={hasMarkedPaid}
        onRecordPayment={onRecordPayment}
        onPrepayment={onPrepayment}
        onDeleteLoan={onDeleteLoan}
      />
      <LoanDetailsSection
        loan={loan}
        metrics={metrics}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />
      <LoanChargesSection loan={loan} formatCurrency={formatCurrency} />
      <LoanAnalyticsSection
        metrics={metrics}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />
      <LoanAutomationSection loan={loan} />
      <LoanPaymentProgressSection
        loan={loan}
        metrics={metrics}
        formatCurrency={formatCurrency}
        onInstallmentPress={onInstallmentPress}
      />
      <LoanPaymentHistorySection
        loan={loan}
        showPaymentHistory={showPaymentHistory}
        formatCurrency={formatCurrency}
        onTogglePaymentHistory={onTogglePaymentHistory}
      />
    </>
  );
}
