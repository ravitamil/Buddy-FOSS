-- Hosted migration version: 20260829131625.
-- Rebuild budgets as complete user-owned financial plans.
-- Live transactions, loans, subscriptions, and savings remain authoritative
-- in their own tables and are joined in the client read model.

ALTER TABLE public.budgets
  DROP COLUMN IF EXISTS category_id,
  DROP COLUMN IF EXISTS amount,
  ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT 'Monthly budget',
  ADD COLUMN IF NOT EXISTS currency_code text NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS monthly_income numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS planned_expenses numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS planned_savings numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS rollover_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS rollover_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS custom_splits jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS category_allocations jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS enable_category_alerts boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS income_sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS track_income_sources boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS linked_recurring_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS auto_populate_from_recurring boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS savings_goal_allocations jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.budgets
SET updated_at = COALESCE(created_at, timezone('utc'::text, now()))
WHERE updated_at IS NULL;

UPDATE public.budgets
SET period = 'monthly'
WHERE period IS NULL;

ALTER TABLE public.budgets
  ALTER COLUMN updated_at SET NOT NULL,
  ALTER COLUMN period SET NOT NULL,
  ADD CONSTRAINT budgets_period_check
    CHECK (period IN ('weekly', 'monthly', 'yearly', 'custom')),
  ADD CONSTRAINT budgets_non_negative_amounts_check
    CHECK (
      monthly_income >= 0 AND
      planned_expenses >= 0 AND
      planned_savings >= 0 AND
      rollover_amount >= 0
    ),
  ADD CONSTRAINT budgets_currency_code_check
    CHECK (currency_code ~ '^[A-Z]{3}$'),
  ADD CONSTRAINT budgets_custom_splits_array_check
    CHECK (jsonb_typeof(custom_splits) = 'array'),
  ADD CONSTRAINT budgets_category_allocations_array_check
    CHECK (jsonb_typeof(category_allocations) = 'array'),
  ADD CONSTRAINT budgets_income_sources_array_check
    CHECK (jsonb_typeof(income_sources) = 'array'),
  ADD CONSTRAINT budgets_recurring_items_array_check
    CHECK (jsonb_typeof(linked_recurring_items) = 'array'),
  ADD CONSTRAINT budgets_savings_allocations_array_check
    CHECK (jsonb_typeof(savings_goal_allocations) = 'array'),
  ADD CONSTRAINT budgets_custom_period_dates_check
    CHECK (
      period <> 'custom' OR
      (start_date IS NOT NULL AND end_date IS NOT NULL AND end_date >= start_date)
    );

CREATE UNIQUE INDEX budgets_one_active_per_user_idx
  ON public.budgets (user_id)
  WHERE is_active;

CREATE INDEX budgets_user_updated_at_idx
  ON public.budgets (user_id, updated_at DESC);

CREATE OR REPLACE FUNCTION public.deactivate_other_user_budgets()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.is_active THEN
    UPDATE public.budgets
    SET is_active = false,
        updated_at = timezone('utc'::text, now())
    WHERE user_id = NEW.user_id
      AND id <> NEW.id
      AND is_active;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS budgets_keep_single_active ON public.budgets;
CREATE TRIGGER budgets_keep_single_active
  BEFORE INSERT OR UPDATE OF is_active ON public.budgets
  FOR EACH ROW
  WHEN (NEW.is_active)
  EXECUTE FUNCTION public.deactivate_other_user_budgets();

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "budgets_all_authenticated" ON public.budgets;
DROP POLICY IF EXISTS "Users can manage own budgets" ON public.budgets;
DROP POLICY IF EXISTS "budgets_select_authenticated" ON public.budgets;
DROP POLICY IF EXISTS "budgets_insert_authenticated" ON public.budgets;
DROP POLICY IF EXISTS "budgets_update_authenticated" ON public.budgets;
DROP POLICY IF EXISTS "budgets_delete_authenticated" ON public.budgets;

CREATE POLICY "budgets_select_authenticated" ON public.budgets
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "budgets_insert_authenticated" ON public.budgets
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "budgets_update_authenticated" ON public.budgets
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "budgets_delete_authenticated" ON public.budgets
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

REVOKE ALL ON TABLE public.budgets FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.budgets TO authenticated;
