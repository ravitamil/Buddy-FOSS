import {RetirementPlanningService, retirementPlanningService} from './RetirementPlanningService';

describe('RetirementPlanningService', () => {
  const service = new RetirementPlanningService();

  describe('calculateFireMilestones', () => {
    it('calculates Lean, Standard, and Fat FIRE milestones correctly', () => {
      const expenses = 40_000;
      const currentSavings = 200_000;
      const years = 20;
      const returnRate = 0.07;

      const milestones = service.calculateFireMilestones(
        expenses,
        currentSavings,
        years,
        returnRate,
      );

      expect(milestones.leanFire).toBe(800_000); // 20x
      expect(milestones.standardFire).toBe(1_000_000); // 25x
      expect(milestones.fatFire).toBe(1_200_000); // 30x
      expect(milestones.safeAnnualWithdrawal).toBe(8_000); // 200k * 0.04
      expect(milestones.safeMonthlyWithdrawal).toBeCloseTo(666.67, 1);
      expect(milestones.progressToStandardFire).toBe(20); // 200k / 1M = 20%
      expect(milestones.progressToLeanFire).toBe(25); // 200k / 800k = 25%

      // Coast FIRE: 1M / (1.07)^20
      const expectedCoastFire = Math.round(1_000_000 / Math.pow(1.07, 20));
      expect(milestones.coastFire).toBe(expectedCoastFire);
      expect(milestones.isCoastFireAchieved).toBe(currentSavings >= expectedCoastFire);
    });

    it('identifies when Coast FIRE is achieved', () => {
      const expenses = 40_000;
      // 1M / (1.07)^20 ≈ 258,419
      const currentSavings = 300_000;
      const milestones = service.calculateFireMilestones(expenses, currentSavings, 20, 0.07);

      expect(milestones.isCoastFireAchieved).toBe(true);
    });
  });

  describe('projectRetirementSavings', () => {
    it('applies monthly compound interest to ongoing contributions and initial savings', () => {
      const currentSavings = 50_000;
      const monthlyContribution = 1_000;
      const years = 10;
      const rate = 0.06;
      const targetSavings = 500_000;

      const projection = service.projectRetirementSavings(
        currentSavings,
        monthlyContribution,
        years,
        rate,
        0,
        targetSavings,
      );

      // Future value of initial savings: 50,000 * (1.06)^10
      const expectedInitialFV = 50_000 * Math.pow(1.06, 10);
      // Future value of monthly annuity: 1000 * ((1 + 0.005)^120 - 1) / 0.005
      const monthlyRate = 0.06 / 12;
      const expectedAnnuityFV = (1_000 * (Math.pow(1 + monthlyRate, 120) - 1)) / monthlyRate;
      const expectedTotal = expectedInitialFV + expectedAnnuityFV;

      expect(projection.projectedSavingsAtRetirement).toBeCloseTo(expectedTotal, 0);
      expect(projection.projectedAnnualIncome).toBeCloseTo(expectedTotal * 0.04, 0);
      expect(projection.shortfall).toBeCloseTo(Math.max(0, targetSavings - expectedTotal), 0);
    });

    it('returns current savings when years to retirement is zero or negative', () => {
      const projection = service.projectRetirementSavings(100_000, 500, 0, 0.07, 0, 200_000);
      expect(projection.projectedSavingsAtRetirement).toBe(100_000);
      expect(projection.projectedAnnualIncome).toBe(4_000);
      expect(projection.shortfall).toBe(100_000);
    });
  });

  describe('calculateRetirementReadiness', () => {
    it('marks as on track if projected >= 75% of target', () => {
      const readiness = service.calculateRetirementReadiness(100_000, 800_000, 1_000_000, 15);
      expect(readiness.isOnTrack).toBe(true);
      expect(readiness.readinessScore).toBe(80);
    });

    it('provides recommendations when behind target', () => {
      const readiness = service.calculateRetirementReadiness(20_000, 300_000, 1_000_000, 15);
      expect(readiness.isOnTrack).toBe(false);
      expect(readiness.readinessScore).toBe(30);
      expect(readiness.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('singleton export', () => {
    it('exports a valid retirementPlanningService instance', () => {
      expect(retirementPlanningService).toBeInstanceOf(RetirementPlanningService);
    });
  });
});
