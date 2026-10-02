-- Enable persistent storage for auth
-- This is handled by Supabase Auth automatically

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  phone_number text,
  cin_id text UNIQUE,
  expo_push_token text,
  is_anonymous boolean DEFAULT false,
  is_pro_override boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_sign_in_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "profiles_select_authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert_authenticated" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = id);
CREATE POLICY "profiles_update_authenticated" ON public.profiles
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = id);

-- Create categories table
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense', 'investment')),
  description text,
  risk_level text CHECK (risk_level IS NULL OR risk_level IN ('low', 'medium', 'high')),
  expected_return numeric,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_authenticated" ON public.categories
  FOR SELECT TO authenticated
  USING (user_id IS NULL OR user_id = (SELECT auth.uid()));

CREATE POLICY "categories_insert_authenticated" ON public.categories
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()) AND is_default = false);

CREATE POLICY "categories_update_authenticated" ON public.categories
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()) AND is_default = false);

CREATE POLICY "categories_delete_authenticated" ON public.categories
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()) AND is_default = false);

-- Create savings_goals table
CREATE TABLE public.savings_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  target_amount numeric NOT NULL,
  current_amount numeric DEFAULT 0,
  deadline timestamp with time zone,
  category text,
  icon text,
  color text,
  notes text,
  is_completed boolean DEFAULT false,
  description text,
  is_recurring boolean NOT NULL DEFAULT false,
  recurrence_frequency text CHECK (
    recurrence_frequency IS NULL OR recurrence_frequency IN (
      'once', 'daily', 'biweekly', 'monthly', 'quarterly', 'semiannually', 'annually'
    )
  ),
  intended_amount numeric,
  recurrence_end_date timestamp with time zone,
  next_occurrence_date timestamp with time zone,
  recurring_template_id uuid,
  is_retirement_goal boolean NOT NULL DEFAULT false,
  retirement_age integer,
  life_expectancy integer,
  annual_retirement_income numeric,
  current_annual_expenses numeric,
  inflation_rate numeric,
  expected_return_rate numeric,
  monthly_contribution numeric,
  employer_contribution numeric,
  social_security_estimate numeric,
  pension_estimate numeric,
  other_income_sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  healthcare_costs_estimate numeric,
  long_term_care_insurance boolean NOT NULL DEFAULT false,
  risk_tolerance text CHECK (
    risk_tolerance IS NULL OR risk_tolerance IN ('conservative', 'moderate', 'aggressive')
  ),
  retirement_readiness_score numeric,
  projected_shortfall numeric,
  recommended_monthly_savings numeric,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "savings_goals_all_authenticated" ON public.savings_goals
  FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON public.savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_next_occurrence
  ON public.savings_goals(user_id, next_occurrence_date)
  WHERE is_recurring;

-- Create wallets table
CREATE TABLE public.wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('cash', 'bank', 'wallet', 'other')),
  balance numeric DEFAULT 0 NOT NULL,
  currency text DEFAULT 'USD' NOT NULL,
  color text,
  icon text,
  is_excluded_from_net_worth boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wallets_all_authenticated" ON public.wallets
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_wallets_user_name
  ON public.wallets(user_id, name);

-- Create groups table
CREATE TABLE public.groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  currency text DEFAULT 'USD',
  icon text,
  is_active boolean NOT NULL DEFAULT true,
  settings jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Create group_members table
CREATE TABLE public.group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  user_id text NOT NULL,
  supabase_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  display_name text,
  avatar_url text,
  role text DEFAULT 'member',
  invite_status text NOT NULL DEFAULT 'accepted'
    CHECK (invite_status IN ('pending', 'accepted', 'declined')),
  invite_email text,
  phone text,
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(group_id, user_id)
);

CREATE TABLE public.group_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text,
  member_id text,
  token text NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at timestamp with time zone NOT NULL
    DEFAULT (timezone('utc'::text, now()) + interval '7 days'),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.group_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name text,
  event_type text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.nudge_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nudger_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  debtor_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE,
  nudged_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE OR REPLACE FUNCTION public.is_member_of_group(target_group_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE group_id = target_group_id
      AND (
        supabase_user_id = (SELECT auth.uid())
        OR user_id = ((SELECT auth.uid())::text)
      )
      AND invite_status = 'accepted'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_group_creator(target_group_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.groups
    WHERE id = target_group_id
      AND created_by = (SELECT auth.uid())
  );
END;
$$;

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nudge_log ENABLE ROW LEVEL SECURITY;

-- Policies for groups and members
CREATE POLICY "groups_select_authenticated" ON public.groups
  FOR SELECT TO authenticated USING (
    created_by = (SELECT auth.uid())
    OR is_member_of_group(id)
  );

CREATE POLICY "groups_insert_authenticated" ON public.groups
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = created_by);

CREATE POLICY "groups_update_authenticated" ON public.groups
  FOR UPDATE TO authenticated
  USING (created_by = (SELECT auth.uid()))
  WITH CHECK (created_by = (SELECT auth.uid()));

CREATE POLICY "groups_delete_authenticated" ON public.groups
  FOR DELETE TO authenticated USING (created_by = (SELECT auth.uid()));

-- Group members policies
CREATE POLICY "group_members_select_authenticated" ON public.group_members
  FOR SELECT TO authenticated USING (
    is_group_creator(group_id)
    OR user_id = (SELECT auth.uid())::text
    OR supabase_user_id = (SELECT auth.uid())
    OR is_member_of_group(group_id)
  );

CREATE POLICY "group_members_insert_authenticated" ON public.group_members
  FOR INSERT TO authenticated WITH CHECK (is_group_creator(group_id));

CREATE POLICY "group_members_update_authenticated" ON public.group_members
  FOR UPDATE TO authenticated
  USING (is_group_creator(group_id))
  WITH CHECK (is_group_creator(group_id));

CREATE POLICY "group_members_delete_authenticated" ON public.group_members
  FOR DELETE TO authenticated USING (
    is_group_creator(group_id)
    OR user_id = (SELECT auth.uid())::text
    OR supabase_user_id = (SELECT auth.uid())
  );

-- Create transactions table (Unified Personal & Group Ledger)
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  description text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  type text,
  
  -- Group & Split fields
  group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE,
  paid_by text,
  received_by text[],
  split_method text, 
  split_among text[],
  split_amounts jsonb,
  split_details jsonb,
  is_settlement boolean DEFAULT false,
  settled_debts text[],
  settled_debt_amounts jsonb,
  transaction_currency text,
  fx_rate_applied numeric,

  -- Feature linkage fields
  loan_id uuid,
  subscription_id uuid,
  savings_goal_id uuid REFERENCES public.savings_goals(id) ON DELETE SET NULL,
  wallet_id uuid REFERENCES public.wallets(id) ON DELETE SET NULL,
  tags jsonb DEFAULT '[]'::jsonb,
  operation_key text,
  
  receipt_url text,
  receipt_urls text[] DEFAULT '{}'::text[],
  notes text,
  
  is_recurring boolean DEFAULT false,
  recurrence_frequency text,
  
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.prevent_transaction_owner_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Transaction owner cannot be changed';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER transactions_keep_owner
  BEFORE UPDATE OF user_id ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_transaction_owner_change();

CREATE POLICY "transactions_select_authenticated_unified" ON public.transactions
  FOR SELECT TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR (group_id IS NOT NULL AND is_member_of_group(group_id))
  );

CREATE POLICY "transactions_insert_authenticated" ON public.transactions
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND (group_id IS NULL OR is_member_of_group(group_id))
  );

CREATE POLICY "transactions_update_authenticated" ON public.transactions
  FOR UPDATE TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR paid_by = ((SELECT auth.uid())::text)
    OR (group_id IS NOT NULL AND is_group_creator(group_id))
  )
  WITH CHECK (
    user_id = (SELECT auth.uid())
    OR paid_by = ((SELECT auth.uid())::text)
    OR (group_id IS NOT NULL AND is_group_creator(group_id))
  );

CREATE POLICY "transactions_delete_authenticated" ON public.transactions
  FOR DELETE TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR paid_by = ((SELECT auth.uid())::text)
    OR (group_id IS NOT NULL AND is_group_creator(group_id))
  );

CREATE INDEX IF NOT EXISTS idx_transactions_group_id ON public.transactions(group_id);
CREATE INDEX IF NOT EXISTS idx_transactions_paid_by ON public.transactions(paid_by);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON public.transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_loan_id ON public.transactions(loan_id);
CREATE INDEX IF NOT EXISTS idx_transactions_savings_goal_id ON public.transactions(savings_goal_id);
CREATE INDEX IF NOT EXISTS idx_transactions_subscription_id ON public.transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_user_operation_key
  ON public.transactions(user_id, operation_key)
  WHERE operation_key IS NOT NULL;

REVOKE ALL ON public.transactions FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;

-- Create budgets table
CREATE TABLE public.budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  currency_code text NOT NULL DEFAULT 'USD' CHECK (currency_code ~ '^[A-Z]{3}$'),
  monthly_income numeric NOT NULL DEFAULT 0 CHECK (monthly_income >= 0),
  planned_expenses numeric NOT NULL DEFAULT 0 CHECK (planned_expenses >= 0),
  planned_savings numeric NOT NULL DEFAULT 0 CHECK (planned_savings >= 0),
  period text NOT NULL DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly', 'yearly', 'custom')),
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  is_active boolean NOT NULL DEFAULT false,
  rollover_enabled boolean NOT NULL DEFAULT false,
  rollover_amount numeric NOT NULL DEFAULT 0 CHECK (rollover_amount >= 0),
  custom_splits jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(custom_splits) = 'array'),
  category_allocations jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(category_allocations) = 'array'),
  enable_category_alerts boolean NOT NULL DEFAULT false,
  income_sources jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(income_sources) = 'array'),
  track_income_sources boolean NOT NULL DEFAULT false,
  linked_recurring_items jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(linked_recurring_items) = 'array'),
  auto_populate_from_recurring boolean NOT NULL DEFAULT false,
  savings_goal_allocations jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(savings_goal_allocations) = 'array'),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CHECK (period <> 'custom' OR (start_date IS NOT NULL AND end_date IS NOT NULL AND end_date >= start_date))
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

CREATE TRIGGER budgets_keep_single_active
  BEFORE INSERT OR UPDATE OF is_active ON public.budgets
  FOR EACH ROW
  WHEN (NEW.is_active)
  EXECUTE FUNCTION public.deactivate_other_user_budgets();

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "budgets_select_authenticated" ON public.budgets
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "budgets_insert_authenticated" ON public.budgets
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "budgets_update_authenticated" ON public.budgets
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "budgets_delete_authenticated" ON public.budgets
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

REVOKE ALL ON TABLE public.budgets FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.budgets TO authenticated;

-- Create investments table
CREATE TABLE public.investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  symbol text,
  amount numeric NOT NULL,
  current_price numeric,
  quantity numeric,
  purchase_date timestamp with time zone,
  type text,
  platform text,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "investments_all_authenticated" ON public.investments
  FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id);

-- Create portfolios table
CREATE TABLE public.portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portfolios_all_authenticated" ON public.portfolios
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Update investments table to link to portfolios and categories
ALTER TABLE public.investments 
ADD COLUMN portfolio_id uuid REFERENCES public.portfolios(id) ON DELETE SET NULL,
ADD COLUMN category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;


-- Create loans table
CREATE TABLE public.loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  lender_name text,
  loan_type text,
  amount numeric NOT NULL,
  remaining_amount numeric,
  interest_rate numeric,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  monthly_payment numeric,
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "loans_all_authenticated" ON public.loans
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Create loan_payments table
CREATE TABLE public.loan_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid REFERENCES public.loans(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  date timestamp with time zone NOT NULL,
  principal_paid numeric,
  interest_paid numeric,
  status text,
  method text,
  note text,
  operation_key text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.loan_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "loan_payments_all_authenticated" ON public.loan_payments
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.loans
      WHERE id = public.loan_payments.loan_id
      AND user_id = auth.uid()
    )
  );

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  amount numeric NOT NULL,
  billing_cycle text NOT NULL, -- weekly, monthly, quarterly, yearly
  next_billing_date timestamp with time zone,
  category text,
  icon text,
  color text,
  status text DEFAULT 'active',
  description text,
  website text,
  auto_pay_enabled boolean DEFAULT false,
  reminder_enabled boolean DEFAULT false,
  reminder_days_before integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_all_authenticated" ON public.subscriptions
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Create subscription_payments table
CREATE TABLE public.subscription_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  date timestamp with time zone NOT NULL,
  status text,
  method text,
  note text,
  transaction_id uuid REFERENCES public.transactions(id) ON DELETE SET NULL,
  operation_key text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscription_payments_all_authenticated" ON public.subscription_payments
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE id = public.subscription_payments.subscription_id
      AND user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "group_invites_select_authenticated" ON public.group_invites
  FOR SELECT TO authenticated USING (
    invited_by = (SELECT auth.uid())
    OR (is_group_creator(group_id) OR is_member_of_group(group_id))
    OR (
      email IS NOT NULL
      AND lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

CREATE POLICY "group_invites_insert_authenticated" ON public.group_invites
  FOR INSERT TO authenticated WITH CHECK (
    invited_by = (SELECT auth.uid())
    AND (is_group_creator(group_id) OR is_member_of_group(group_id))
  );

CREATE POLICY "group_activity_select_authenticated" ON public.group_activity
  FOR SELECT TO authenticated USING (is_member_of_group(group_id));

CREATE POLICY "group_activity_insert_authenticated" ON public.group_activity
  FOR INSERT TO authenticated WITH CHECK (
    is_member_of_group(group_id)
    AND actor_user_id = (SELECT auth.uid())
  );

CREATE POLICY "nudge_log_select_authenticated" ON public.nudge_log
  FOR SELECT TO authenticated USING (nudger_id = (SELECT auth.uid()));

CREATE POLICY "nudge_log_insert_authenticated" ON public.nudge_log
  FOR INSERT TO authenticated WITH CHECK (nudger_id = (SELECT auth.uid()));

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscription_payments_subscription_operation_key
  ON public.subscription_payments(subscription_id, operation_key)
  WHERE operation_key IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscription_payments_transaction_id
  ON public.subscription_payments(transaction_id)
  WHERE transaction_id IS NOT NULL;

CREATE TABLE public.feature_controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  environment text NOT NULL DEFAULT 'production',
  platform text NOT NULL DEFAULT 'all' CHECK (platform IN ('all', 'android', 'ios')),
  feature_key text NOT NULL,
  status text NOT NULL
    CHECK (status IN ('enabled', 'hidden', 'read_only', 'maintenance', 'disabled')),
  message text,
  action_overrides jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (environment, platform, feature_key)
);

ALTER TABLE public.feature_controls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feature_controls_public_select" ON public.feature_controls
  FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX feature_controls_lookup_idx
  ON public.feature_controls(environment, platform, feature_key);

ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_loan_id_fkey
    FOREIGN KEY (loan_id) REFERENCES public.loans(id) ON DELETE SET NULL,
  ADD CONSTRAINT transactions_subscription_id_fkey
    FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_loan_payments_loan_operation_key
  ON public.loan_payments(loan_id, operation_key)
  WHERE operation_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_group_id ON public.transactions(group_id);
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON public.groups(created_by);
CREATE INDEX IF NOT EXISTS idx_categories_user_type ON public.categories(user_id, type);
CREATE INDEX IF NOT EXISTS idx_categories_is_default ON public.categories(is_default);
CREATE INDEX IF NOT EXISTS idx_investments_portfolio_id ON public.investments(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_investments_category_id ON public.investments(category_id);
CREATE INDEX IF NOT EXISTS idx_loan_payments_loan_id ON public.loan_payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_subscription_id ON public.subscription_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_paid_by ON public.transactions(paid_by);
CREATE INDEX IF NOT EXISTS idx_group_activity_actor_user_id ON public.group_activity(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_group_invites_invited_by ON public.group_invites(invited_by);
CREATE INDEX IF NOT EXISTS idx_nudge_log_debtor_id ON public.nudge_log(debtor_id);
CREATE INDEX IF NOT EXISTS idx_nudge_log_group_id ON public.nudge_log(group_id);

-- Revoke anonymous access on public schema
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE CREATE ON SCHEMA public FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.feature_controls TO anon;

-- Grant authenticated privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
REVOKE UPDATE ON TABLE public.group_invites FROM authenticated;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_group_creator(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_member_of_group(uuid) TO authenticated;
