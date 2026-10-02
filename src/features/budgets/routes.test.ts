import {budgetRoutes} from './routes';

describe('budgetRoutes', () => {
  it('keeps create, edit, and details intents distinct', () => {
    expect(budgetRoutes.create()).toBe('/budget-setup?mode=create');
    expect(budgetRoutes.edit('plan/one')).toBe('/budget-setup?budgetId=plan%2Fone');
    expect(budgetRoutes.details('plan/one')).toBe('/budget-details?budgetId=plan%2Fone');
  });
});
