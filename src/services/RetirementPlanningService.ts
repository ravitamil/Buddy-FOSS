import type {
  FireMilestones,
  RetirementGoal,
  RetirementNeeds,
  RetirementProjection,
  RetirementReadiness,
} from '../types';

export class RetirementPlanningService {
  /**
   * Calculate retirement needs based on expenses, age, and inflation
   */
  calculateRetirementNeeds(
    currentAnnualExpenses: number,
    retirementAge: number,
    currentAge: number,
    lifeExpectancy: number,
    inflationRate: number = 0.03,
    healthcareCostsEstimate: number = 0.05,
  ): RetirementNeeds {
    const yearsInRetirement = Math.max(0, lifeExpectancy - retirementAge);
    const yearsToRetirement = Math.max(0, retirementAge - currentAge);
    const inflationAdjustedExpenses =
      currentAnnualExpenses * Math.pow(1 + inflationRate, yearsToRetirement);

    // Full lifestyle maintenance under FIRE requires 100% of adjusted expenses
    const annualRetirementIncomeNeeded = inflationAdjustedExpenses;
    const healthcareCosts = annualRetirementIncomeNeeded * healthcareCostsEstimate;
    const totalRetirementSavingsNeeded = (annualRetirementIncomeNeeded + healthcareCosts) * 25;

    return {
      annualRetirementIncomeNeeded,
      totalRetirementSavingsNeeded,
      yearsInRetirement,
      healthcareCostsEstimate: healthcareCosts,
      inflationAdjustedExpenses,
    };
  }

  /**
   * Calculate FIRE (Financial Independence, Retire Early) milestones:
   * - Lean FIRE: 20x annual expenses (5% SWR, covering basic essentials)
   * - Standard FIRE: 25x annual expenses (4% SWR, 100% lifestyle maintenance)
   * - Fat FIRE: 30x annual expenses (3.33% SWR, luxury/cushion)
   * - Coast FIRE: Current balance needed to reach Standard FIRE by retirement age with $0 added
   */
  calculateFireMilestones(
    annualExpenses: number,
    currentSavings: number,
    yearsToRetirement: number,
    expectedReturnRate: number = 0.07,
  ): FireMilestones {
    const leanFire = Math.round(annualExpenses * 20);
    const standardFire = Math.round(annualExpenses * 25);
    const fatFire = Math.round(annualExpenses * 30);

    const growthFactor =
      yearsToRetirement > 0 ? Math.pow(1 + expectedReturnRate, yearsToRetirement) : 1;
    const coastFire = growthFactor > 0 ? Math.round(standardFire / growthFactor) : standardFire;
    const isCoastFireAchieved = currentSavings >= coastFire;

    const safeAnnualWithdrawal = currentSavings * 0.04;
    const safeMonthlyWithdrawal = safeAnnualWithdrawal / 12;

    return {
      leanFire,
      standardFire,
      fatFire,
      coastFire,
      isCoastFireAchieved,
      safeMonthlyWithdrawal,
      safeAnnualWithdrawal,
      progressToStandardFire:
        standardFire > 0 ? Math.min(100, (currentSavings / standardFire) * 100) : 0,
      progressToLeanFire: leanFire > 0 ? Math.min(100, (currentSavings / leanFire) * 100) : 0,
      progressToFatFire: fatFire > 0 ? Math.min(100, (currentSavings / fatFire) * 100) : 0,
    };
  }

  /**
   * Project retirement savings growth using actuarially sound compound interest
   */
  projectRetirementSavings(
    currentSavings: number,
    monthlyContribution: number,
    yearsToRetirement: number,
    expectedReturnRate: number = 0.07,
    employerContribution: number = 0,
    targetSavings: number = 0,
  ): RetirementProjection {
    if (yearsToRetirement <= 0) {
      return {
        currentSavings,
        projectedSavingsAtRetirement: currentSavings,
        projectedAnnualIncome: currentSavings * 0.04,
        shortfall: Math.max(0, targetSavings - currentSavings),
        yearsToRetirement: 0,
        monthlyContributionNeeded: 0,
        growthAssumptions: {
          investmentReturn: expectedReturnRate,
          inflationRate: 0.03,
        },
      };
    }

    const monthlyRate = expectedReturnRate / 12;
    const numberOfMonths = yearsToRetirement * 12;

    // Future value of existing savings: P * (1 + r)^t
    const futureValueOfSavings =
      currentSavings * Math.pow(1 + expectedReturnRate, yearsToRetirement);

    // Future value of ordinary annuity with monthly compounding: PMT * ((1 + i)^n - 1) / i
    const futureValueOfContributions =
      monthlyRate > 0
        ? (monthlyContribution * (Math.pow(1 + monthlyRate, numberOfMonths) - 1)) / monthlyRate
        : monthlyContribution * numberOfMonths;

    const futureValueOfEmployerContributions =
      monthlyRate > 0
        ? (employerContribution * (Math.pow(1 + monthlyRate, numberOfMonths) - 1)) / monthlyRate
        : employerContribution * numberOfMonths;

    const projectedSavingsAtRetirement =
      futureValueOfSavings + futureValueOfContributions + futureValueOfEmployerContributions;

    const projectedAnnualIncome = projectedSavingsAtRetirement * 0.04;
    const shortfall = Math.max(0, targetSavings - projectedSavingsAtRetirement);

    const monthlyContributionNeeded = this.calculateRequiredMonthlyContribution(
      currentSavings,
      yearsToRetirement,
      expectedReturnRate,
      targetSavings,
    );

    return {
      currentSavings,
      projectedSavingsAtRetirement,
      projectedAnnualIncome,
      shortfall,
      yearsToRetirement,
      monthlyContributionNeeded,
      growthAssumptions: {
        investmentReturn: expectedReturnRate,
        inflationRate: 0.03,
      },
    };
  }

  /**
   * Calculate retirement / FIRE readiness score (0-100)
   */
  calculateRetirementReadiness(
    currentSavings: number,
    projectedSavings: number,
    targetSavings: number,
    yearsToRetirement: number,
  ): RetirementReadiness {
    const progressPercentage = targetSavings > 0 ? (projectedSavings / targetSavings) * 100 : 100;
    const readinessScore = Math.min(100, Math.max(0, progressPercentage));
    const isOnTrack = readinessScore >= 75;

    const recommendations: string[] = [];
    if (readinessScore < 50) {
      recommendations.push('Increase your monthly contributions to reach financial independence.');
      recommendations.push('Optimize spending to raise your savings rate.');
    } else if (readinessScore < 75) {
      recommendations.push('Review investment asset allocation for balanced growth.');
      recommendations.push('Increase monthly investments slightly to reach full FIRE sooner.');
    } else if (readinessScore < 100) {
      recommendations.push(
        'You are close to your target trajectory! Reinvest dividends to accelerate FIRE.',
      );
    } else {
      recommendations.push("You're fully on track for financial independence!");
    }

    const projectedRetirementAge =
      yearsToRetirement > 0
        ? targetSavings > projectedSavings
          ? yearsToRetirement + 3
          : yearsToRetirement
        : 0;

    return {
      readinessScore,
      isOnTrack,
      recommendations,
      projectedRetirementAge,
    };
  }

  /**
   * Create a comprehensive retirement / FIRE plan
   */
  createRetirementPlan(retirementGoal: RetirementGoal): {
    needs: RetirementNeeds;
    projection: RetirementProjection;
    readiness: RetirementReadiness;
    fireMilestones: FireMilestones;
  } {
    const yearsToRetirement = Math.max(
      0,
      retirementGoal.retirementAge -
        this.calculateCurrentAge(retirementGoal.deadline, retirementGoal.retirementAge),
    );

    const needs = this.calculateRetirementNeeds(
      retirementGoal.currentAnnualExpenses,
      retirementGoal.retirementAge,
      retirementGoal.retirementAge - yearsToRetirement,
      retirementGoal.lifeExpectancy,
      retirementGoal.inflationRate,
      retirementGoal.healthcareCostsEstimate || 0.05,
    );

    const targetAmount = retirementGoal.targetAmount || needs.totalRetirementSavingsNeeded;

    const projection = this.projectRetirementSavings(
      retirementGoal.currentAmount,
      retirementGoal.monthlyContribution,
      yearsToRetirement,
      retirementGoal.expectedReturnRate,
      retirementGoal.employerContribution || 0,
      targetAmount,
    );

    const readiness = this.calculateRetirementReadiness(
      retirementGoal.currentAmount,
      projection.projectedSavingsAtRetirement,
      targetAmount,
      yearsToRetirement,
    );

    const fireMilestones = this.calculateFireMilestones(
      retirementGoal.currentAnnualExpenses,
      retirementGoal.currentAmount,
      yearsToRetirement,
      retirementGoal.expectedReturnRate,
    );

    return {
      needs,
      projection,
      readiness,
      fireMilestones,
    };
  }

  /**
   * Calculate required monthly contribution to reach target savings
   */
  calculateRequiredMonthlyContribution(
    currentSavings: number,
    yearsToRetirement: number,
    expectedReturnRate: number,
    targetAmount: number,
  ): number {
    if (yearsToRetirement <= 0) return 0;

    const futureValueOfSavings =
      currentSavings * Math.pow(1 + expectedReturnRate, yearsToRetirement);
    const shortfall = Math.max(0, targetAmount - futureValueOfSavings);

    if (shortfall <= 0) return 0;

    const monthlyRate = expectedReturnRate / 12;
    const numberOfMonths = yearsToRetirement * 12;

    if (monthlyRate === 0) {
      return shortfall / numberOfMonths;
    }

    return (shortfall * monthlyRate) / (Math.pow(1 + monthlyRate, numberOfMonths) - 1);
  }

  /**
   * Derive current age based on retirement deadline and target age
   */
  calculateCurrentAge(retirementDate: Date | string, retirementAge: number): number {
    const date = retirementDate instanceof Date ? retirementDate : new Date(retirementDate);
    const currentDate = new Date();
    const remainingYears = Math.max(
      0,
      Math.round((date.getTime() - currentDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)),
    );
    return Math.max(18, retirementAge - remainingYears);
  }
}

export const retirementPlanningService = new RetirementPlanningService();
