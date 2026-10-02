import fs from 'fs';
import path from 'path';

const uiDirectory = __dirname;
const uiIndexPath = path.join(uiDirectory, 'index.ts');

const forbiddenDomainExports = [
  'AnimatedCreditCard',
  'BudgetCard',
  'BudgetPlanningCard',
  'CardBrandImages',
  'CreditCardForm',
  'CreditCardLogos',
  'DottedBackgroundShowcase',
  'FinancialPlanningQuickActionsCard',
  'GiftedChartsExample',
  'GroupCard',
  'GroupEmptyState',
  'GroupErrorBoundary',
  'GroupFilterModal',
  'LazyInvestmentChart',
  'QuickActionsCard',
  'ShadowShowcase',
  'TamaguiAnimatedButton',
  'TransactionItem',
  'WalletWithCards',
];

const forbiddenDomainFiles = [
  'AnimatedCreditCard.tsx',
  'BudgetCard.tsx',
  'BudgetPlanningCard.tsx',
  'CardBrandImages.tsx',
  'CreditCardForm.tsx',
  'CreditCardLogos.tsx',
  'DottedBackgroundShowcase.tsx',
  'FinancialPlanningQuickActionsCard.tsx',
  'GroupCard.tsx',
  'GroupEmptyState.tsx',
  'GroupFilterModal.tsx',
  'LazyInvestmentChart.tsx',
  'QuickActionsCard.tsx',
  'ShadowShowcase.tsx',
  'TamaguiAnimatedButton.tsx',
  'TransactionItem.tsx',
  'WalletWithCards.tsx',
];

describe('generic UI component boundary', () => {
  it('does not export feature-domain components from the UI barrel', () => {
    const uiIndexSource = fs.readFileSync(uiIndexPath, 'utf8');

    const leakedExports = forbiddenDomainExports.filter((componentName) =>
      new RegExp(`\\b${componentName}\\b`).test(uiIndexSource),
    );

    expect(leakedExports).toEqual([]);
  });

  it('does not keep known feature-domain files in src/components/ui', () => {
    const leakedFiles = forbiddenDomainFiles.filter((fileName) =>
      fs.existsSync(path.join(uiDirectory, fileName)),
    );

    expect(leakedFiles).toEqual([]);
  });
});
