import {createHomeActions} from './homeActions';

describe('homeActions', () => {
  it('creates static and conditional home navigation actions', () => {
    const navigate = jest.fn();
    const scrollToTop = jest.fn();
    const actions = createHomeActions({
      navigate,
      scrollToTop,
      hasActiveBudget: true,
      activeBudgetId: 'budget-1',
      retirementGoalId: 'retirement-1',
    });

    actions.scrollToTop();
    actions.openProfile();
    actions.openNotifications();
    actions.openAnalytics();
    actions.openTransactions();
    actions.editBudget();
    actions.viewBudgetDetails();
    actions.setupBudget();
    actions.openDebtPayoff();
    actions.openRetirement();
    actions.openNetWorth();
    actions.openGroups();
    actions.addGroup();
    actions.addTransaction();

    expect(scrollToTop).toHaveBeenCalledTimes(1);
    expect(navigate.mock.calls).toEqual([
      ['/profile-settings'],
      ['/active-notifications'],
      ['/analytics'],
      ['/transactions'],
      ['/budget-setup?budgetId=budget-1'],
      ['/budget-details?budgetId=budget-1'],
      ['/budget-setup?mode=create'],
      ['/debt-payoff'],
      ['/savings/retirement-1'],
      ['/net-worth'],
      ['/groups'],
      ['/add-group'],
      ['/add-transaction'],
    ]);
  });

  it('uses setup routes when budget and retirement data are absent', () => {
    const navigate = jest.fn();
    const actions = createHomeActions({
      navigate,
      scrollToTop: jest.fn(),
      hasActiveBudget: false,
    });

    actions.viewBudgetDetails();
    actions.openRetirement();

    expect(navigate.mock.calls).toEqual([['/budget-setup?mode=create'], ['/retirement-planning']]);
  });
});
