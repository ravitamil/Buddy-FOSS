export interface HomeLoadingState {
  areSettingsInitialized: boolean;
  isBudgetsLoading: boolean;
  isTransactionsLoading: boolean;
}

/**
 * Home values are currency-formatted, so settings hydration is a required
 * readiness dependency alongside the underlying financial data.
 */
export const isHomeContentLoading = ({
  areSettingsInitialized,
  isBudgetsLoading,
  isTransactionsLoading,
}: HomeLoadingState): boolean =>
  !areSettingsInitialized || isTransactionsLoading || isBudgetsLoading;
