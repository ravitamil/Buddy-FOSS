export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidationOptions {
  allowEmptyTransactions?: boolean;
  allowSingleMember?: boolean;
  maxMembers?: number;
  maxTransactions?: number;
  strictAmountValidation?: boolean;
}
