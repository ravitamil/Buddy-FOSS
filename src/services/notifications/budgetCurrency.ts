export const formatBudgetCurrency = (amount: number, currencyCode: string): string => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toLocaleString(undefined, {maximumFractionDigits: 2})}`;
  }
};
