-- Migration: Complete Security & Performance Hardening
-- Date: 2026-02-18

-- ==========================================
-- 1. SECURITY HARDENING (RLS & Role Binding)
-- ==========================================

-- profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles viewable by self or group members" ON public.profiles;

CREATE POLICY "profiles_select_authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true); -- Restricted to authenticated users
CREATE POLICY "profiles_insert_authenticated" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_authenticated" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- categories
DROP POLICY IF EXISTS "Users can view own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can manage own categories" ON public.categories;

CREATE POLICY "categories_all_authenticated" ON public.categories
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- savings_goals
DROP POLICY IF EXISTS "Users can view own savings goals" ON public.savings_goals;
DROP POLICY IF EXISTS "Users can manage own savings goals" ON public.savings_goals;

CREATE POLICY "savings_goals_all_authenticated" ON public.savings_goals
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- groups
DROP POLICY IF EXISTS "Users can view groups they match" ON public.groups;
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.groups;
DROP POLICY IF EXISTS "Users can insert groups" ON public.groups;
DROP POLICY IF EXISTS "Users can update groups they are members of" ON public.groups;

CREATE POLICY "groups_select_authenticated" ON public.groups
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = public.groups.id
      AND user_id = auth.uid()
    )
  );
CREATE POLICY "groups_insert_authenticated" ON public.groups
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "groups_update_authenticated" ON public.groups
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = public.groups.id
      AND user_id = auth.uid()
    )
  );

-- group_members
DROP POLICY IF EXISTS "Users can view members of their groups" ON public.group_members;

CREATE POLICY "group_members_select_authenticated" ON public.group_members
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = public.group_members.group_id
      AND gm.user_id = auth.uid()
    )
  );

-- transactions (SECURITY & PERFORMANCE: Policy Consolidation)
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view own or group transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view transactions of their groups" ON public.transactions;

CREATE POLICY "transactions_select_authenticated_unified" ON public.transactions
  FOR SELECT TO authenticated USING (
    auth.uid() = user_id OR 
    (group_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = public.transactions.group_id
      AND user_id = auth.uid()
    ))
  );
CREATE POLICY "transactions_insert_authenticated" ON public.transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "transactions_update_authenticated" ON public.transactions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "transactions_delete_authenticated" ON public.transactions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- budgets (Cleanup previously created singular policies and consolidate)
DROP POLICY IF EXISTS "budgets_select_authenticated" ON public.budgets;
DROP POLICY IF EXISTS "budgets_insert_authenticated" ON public.budgets;
DROP POLICY IF EXISTS "budgets_update_authenticated" ON public.budgets;
DROP POLICY IF EXISTS "budgets_delete_authenticated" ON public.budgets;
DROP POLICY IF EXISTS "Users can manage own budgets" ON public.budgets;

CREATE POLICY "budgets_all_authenticated" ON public.budgets
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- investments
DROP POLICY IF EXISTS "Users can manage own investments" ON public.investments;

CREATE POLICY "investments_all_authenticated" ON public.investments
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- portfolios
DROP POLICY IF EXISTS "Users can manage own portfolios" ON public.portfolios;

CREATE POLICY "portfolios_all_authenticated" ON public.portfolios
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- investment_categories
DROP POLICY IF EXISTS "Users can manage own investment categories" ON public.investment_categories;
DROP POLICY IF EXISTS "Users can manage own investment_categories" ON public.investment_categories;

CREATE POLICY "investment_categories_all_authenticated" ON public.investment_categories
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- credit_cards
DROP POLICY IF EXISTS "Users can manage own credit cards" ON public.credit_cards;
DROP POLICY IF EXISTS "Users can manage own credit_cards" ON public.credit_cards;

CREATE POLICY "credit_cards_all_authenticated" ON public.credit_cards
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- loans
DROP POLICY IF EXISTS "Users can manage own loans" ON public.loans;

CREATE POLICY "loans_all_authenticated" ON public.loans
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- loan_payments
DROP POLICY IF EXISTS "Users can manage own loan payments" ON public.loan_payments;

CREATE POLICY "loan_payments_all_authenticated" ON public.loan_payments
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.loans
      WHERE id = public.loan_payments.loan_id
      AND user_id = auth.uid()
    )
  );

-- subscriptions
DROP POLICY IF EXISTS "Users can manage own subscriptions" ON public.subscriptions;

CREATE POLICY "subscriptions_all_authenticated" ON public.subscriptions
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- subscription_payments
DROP POLICY IF EXISTS "Users can manage own subscription payments" ON public.subscription_payments;

CREATE POLICY "subscription_payments_all_authenticated" ON public.subscription_payments
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE id = public.subscription_payments.subscription_id
      AND user_id = auth.uid()
    )
  );

-- storage.objects (Avatars)
DROP POLICY IF EXISTS "Public access to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;

CREATE POLICY "avatars_select_authenticated" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'avatars');
CREATE POLICY "avatars_upsert_authenticated" ON storage.objects
  FOR ALL TO authenticated WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);

-- ==========================================
-- 2. PERFORMANCE OPTIMIZATIONS (INDEXES)
-- ==========================================

-- Create missing indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_budgets_category_id ON public.budgets(category_id);
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON public.groups(created_by);
CREATE INDEX IF NOT EXISTS idx_investment_categories_user_id ON public.investment_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_portfolio_id ON public.investments(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_loan_payments_loan_id ON public.loan_payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_subscription_id ON public.subscription_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_paid_by ON public.transactions(paid_by);

-- Cleanup unused indexes
DROP INDEX IF EXISTS public.idx_transactions_group_id;
DROP INDEX IF EXISTS public.idx_group_members_group_id;

-- ==========================================
-- 3. SCHEMA INTEGRITY
-- ==========================================

-- Revoke all permissions from public schema for anonymous role
-- This is already mostly handled by Supabase, but let's be thorough
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
