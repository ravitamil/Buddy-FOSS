import type {
  RetirementPlanFormData,
  RetirementRiskTolerance,
} from '@/features/savings/hooks/useCreateRetirementPlanScreen';
import type {FireMilestones, SavingsGoal} from '@/types';

export interface CreateRetirementPlanFormSectionsProps {
  currencySymbol: string;
  errors: Record<string, string>;
  fireMilestones?: FireMilestones;
  fireNumber?: number;
  formData: RetirementPlanFormData;
  formatCurrency: (amount: number) => string;
  goal: SavingsGoal | null;
  handleDeleteRetirementGoal: () => void;
  setShowRiskProfileSheet: (open: boolean) => void;
  showRiskProfileSheet: boolean;
  updateField: RetirementPlanUpdateField;
}

export type RetirementPlanUpdateField = <Field extends keyof RetirementPlanFormData>(
  field: Field,
  value: RetirementPlanFormData[Field],
) => void;

export interface RiskProfileOption {
  key: RetirementRiskTolerance;
  label: string;
  description: string;
}

export type RetirementFormSectionProps = Pick<
  CreateRetirementPlanFormSectionsProps,
  'currencySymbol' | 'errors' | 'formData' | 'updateField'
>;
