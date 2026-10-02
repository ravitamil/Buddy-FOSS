import {savingsGoalDatabaseService} from './SavingsGoalDatabaseService';
import {SavingsGoal} from '../types';

describe('SavingsGoalDatabaseService offline storage', () => {
  const sampleGoal: SavingsGoal = {
    id: 'goal-test-1',
    name: 'Vacation',
    targetAmount: 1000,
    currentAmount: 200,
    deadline: new Date('2026-12-31'),
    category: 'Travel',
    color: '#3B82F6',
    icon: 'airplane',
    isCompleted: false,
  };

  it('creates and retrieves savings goals locally', async () => {
    await savingsGoalDatabaseService.createGoal('local_user', sampleGoal);
    const goals = await savingsGoalDatabaseService.getGoals('local_user');
    expect(goals.some((g) => g.id === 'goal-test-1')).toBe(true);
  });

  it('deposits to goal atomically and updates balance', async () => {
    await savingsGoalDatabaseService.createGoal('local_user', sampleGoal);

    const result = await savingsGoalDatabaseService.depositToGoal(
      'local_user',
      'goal-test-1',
      300,
      undefined,
      'Trip fund',
    );

    expect(result.goalId).toBe('goal-test-1');
    expect(result.currentAmount).toBe(500);
    expect(result.isCompleted).toBe(false);

    const goals = await savingsGoalDatabaseService.getGoals('local_user');
    const updated = goals.find((g) => g.id === 'goal-test-1');
    expect(updated?.currentAmount).toBe(500);
  });

  it('marks goal completed when target amount is reached', async () => {
    const result = await savingsGoalDatabaseService.depositToGoal('local_user', 'goal-test-1', 600);

    expect(result.currentAmount).toBe(1100);
    expect(result.isCompleted).toBe(true);
  });

  it('deletes savings goal locally', async () => {
    await savingsGoalDatabaseService.deleteGoal('local_user', 'goal-test-1');
    const goals = await savingsGoalDatabaseService.getGoals('local_user');
    expect(goals.some((g) => g.id === 'goal-test-1')).toBe(false);
  });
});
