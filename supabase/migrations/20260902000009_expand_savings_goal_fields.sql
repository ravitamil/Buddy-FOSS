-- Preserve the complete savings and retirement domain model in PostgreSQL.
ALTER TABLE public.savings_goals
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS is_recurring boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurrence_frequency text,
  ADD COLUMN IF NOT EXISTS intended_amount numeric,
  ADD COLUMN IF NOT EXISTS recurrence_end_date timestamp with time zone,
  ADD COLUMN IF NOT EXISTS next_occurrence_date timestamp with time zone,
  ADD COLUMN IF NOT EXISTS recurring_template_id uuid,
  ADD COLUMN IF NOT EXISTS is_retirement_goal boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS retirement_age integer,
  ADD COLUMN IF NOT EXISTS life_expectancy integer,
  ADD COLUMN IF NOT EXISTS annual_retirement_income numeric,
  ADD COLUMN IF NOT EXISTS current_annual_expenses numeric,
  ADD COLUMN IF NOT EXISTS inflation_rate numeric,
  ADD COLUMN IF NOT EXISTS expected_return_rate numeric,
  ADD COLUMN IF NOT EXISTS monthly_contribution numeric,
  ADD COLUMN IF NOT EXISTS employer_contribution numeric,
  ADD COLUMN IF NOT EXISTS social_security_estimate numeric,
  ADD COLUMN IF NOT EXISTS pension_estimate numeric,
  ADD COLUMN IF NOT EXISTS other_income_sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS healthcare_costs_estimate numeric,
  ADD COLUMN IF NOT EXISTS long_term_care_insurance boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS risk_tolerance text,
  ADD COLUMN IF NOT EXISTS retirement_readiness_score numeric,
  ADD COLUMN IF NOT EXISTS projected_shortfall numeric,
  ADD COLUMN IF NOT EXISTS recommended_monthly_savings numeric;

ALTER TABLE public.savings_goals
  DROP CONSTRAINT IF EXISTS savings_goals_recurrence_frequency_check,
  DROP CONSTRAINT IF EXISTS savings_goals_risk_tolerance_check,
  ADD CONSTRAINT savings_goals_recurrence_frequency_check
    CHECK (
      recurrence_frequency IS NULL
      OR recurrence_frequency IN (
        'once',
        'daily',
        'biweekly',
        'monthly',
        'quarterly',
        'semiannually',
        'annually'
      )
    ),
  ADD CONSTRAINT savings_goals_risk_tolerance_check
    CHECK (
      risk_tolerance IS NULL
      OR risk_tolerance IN ('conservative', 'moderate', 'aggressive')
    );

CREATE INDEX IF NOT EXISTS idx_savings_goals_user_next_occurrence
  ON public.savings_goals(user_id, next_occurrence_date)
  WHERE is_recurring;
