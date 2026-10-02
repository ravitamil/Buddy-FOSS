import type {LoanData} from '../../types/loan.types';

export function sortActiveLoansBySnowball(loans: LoanData[]): LoanData[] {
  return getActiveLoans(loans).sort((a, b) => a.currentOutstanding - b.currentOutstanding);
}

export function sortActiveLoansByAvalanche(loans: LoanData[]): LoanData[] {
  return getActiveLoans(loans).sort((a, b) => b.interestRate - a.interestRate);
}

export function sortActiveLoansBySnowflake(loans: LoanData[]): LoanData[] {
  return getActiveLoans(loans).sort((a, b) => {
    const aRatio = (a.currentOutstanding * a.interestRate) / 100;
    const bRatio = (b.currentOutstanding * b.interestRate) / 100;
    return aRatio - bRatio;
  });
}

export function sortActiveLoansByCustomOrder(loans: LoanData[], customOrder: string[]): LoanData[] {
  return getActiveLoans(loans).sort((a, b) => {
    const indexA = customOrder.indexOf(a.id);
    const indexB = customOrder.indexOf(b.id);

    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
}

export function getActiveLoans(loans: LoanData[]): LoanData[] {
  return loans.filter((loan) => loan.status === 'ACTIVE');
}
