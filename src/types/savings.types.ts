import type {RecurrenceFrequency} from './common.types';

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  category?: string;
  description?: string;
  notes?: string;
  icon?: string;
  color?: string;
  isCompleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  isRecurring?: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  intendedAmount?: number;
  recurrenceEndDate?: Date;
  nextOccurrenceDate?: Date;
  recurringTemplateId?: string;
  isRetirementGoal?: boolean;
  retirementAge?: number;
  lifeExpectancy?: number;
  annualRetirementIncome?: number;
  currentAnnualExpenses?: number;
  inflationRate?: number;
  expectedReturnRate?: number;
  monthlyContribution?: number;
  employerContribution?: number;
  socialSecurityEstimate?: number;
  pensionEstimate?: number;
  otherIncomeSources?: {
    source: string;
    monthlyAmount: number;
    startDate?: Date;
    endDate?: Date;
  }[];
  healthcareCostsEstimate?: number;
  longTermCareInsurance?: boolean;
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
  retirementReadinessScore?: number;
  projectedShortfall?: number;
  recommendedMonthlySavings?: number;
}

export interface RetirementGoal extends SavingsGoal {
  retirementAge: number;
  lifeExpectancy: number;
  annualRetirementIncome: number;
  currentAnnualExpenses: number;
  inflationRate: number;
  expectedReturnRate: number;
  monthlyContribution: number;
  employerContribution?: number;
  socialSecurityEstimate?: number;
  pensionEstimate?: number;
  otherIncomeSources?: {
    source: string;
    monthlyAmount: number;
    startDate?: Date;
    endDate?: Date;
  }[];
  healthcareCostsEstimate?: number;
  longTermCareInsurance?: boolean;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  retirementReadinessScore?: number;
  projectedShortfall?: number;
  recommendedMonthlySavings?: number;
}

export interface RetirementNeeds {
  annualRetirementIncomeNeeded: number;
  totalRetirementSavingsNeeded: number;
  yearsInRetirement: number;
  healthcareCostsEstimate: number;
  inflationAdjustedExpenses: number;
}

export interface RetirementProjection {
  currentSavings: number;
  projectedSavingsAtRetirement: number;
  projectedAnnualIncome: number;
  shortfall: number;
  yearsToRetirement: number;
  monthlyContributionNeeded: number;
  growthAssumptions: {
    investmentReturn: number;
    inflationRate: number;
  };
}

export interface RetirementReadiness {
  readinessScore: number;
  isOnTrack: boolean;
  recommendations: string[];
  projectedRetirementAge: number;
}

export interface FireMilestones {
  leanFire: number;
  standardFire: number;
  fatFire: number;
  coastFire: number;
  isCoastFireAchieved: boolean;
  safeMonthlyWithdrawal: number;
  safeAnnualWithdrawal: number;
  progressToStandardFire: number;
  progressToLeanFire: number;
  progressToFatFire: number;
}
