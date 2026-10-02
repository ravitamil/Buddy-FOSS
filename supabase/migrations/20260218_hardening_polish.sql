-- Migration: Hardening Polish & RLS Optimization
-- Date: 2026-02-18

-- ==========================================
-- 1. CLEANUP MISSING REDUNDANT POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Users can manage own savings_goals" ON public.savings_goals;
DROP POLICY IF EXISTS "Users can view own or group transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view transactions of their groups" ON public.transactions;


-- ==========================================
-- 2. RLS PERFORMANCE OPTIMIZATION (INITPLAN)
-- ==========================================
-- Wrapping auth.uid() and auth.role() in (SELECT auth.uid()) prevents re-evaluation per row.

-- profiles
DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_authenticated" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_authenticated" ON public.profiles;

CREATE POLICY "profiles_select_authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert_authenticated" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = id);
CREATE POLICY "profiles_update_authenticated" ON public.profiles
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = id);

-- categories
DROP POLICY IF EXISTS "categories_all_authenticated" ON public.categories;
CREATE POLICY "categories_all_authenticated" ON public.categories
  FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id);

-- savings_goals
DROP POLICY IF EXISTS "savings_goals_all_authenticated" ON public.savings_goals;
CREATE POLICY "savings_goals_all_authenticated" ON public.savings_goals
  FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id);

-- groups
DROP POLICY IF EXISTS "groups_select_authenticated" ON public.groups;
DROP POLICY IF EXISTS "groups_insert_authenticated" ON public.groups;
DROP POLICY IF EXISTS "groups_update_authenticated" ON public.groups;

CREATE POLICY "groups_select_authenticated" ON public.groups
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = public.groups.id
      AND user_id = (SELECT auth.uid())
    )
  );
CREATE POLICY "groups_insert_authenticated" ON public.groups
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = created_by);
CREATE POLICY "groups_update_authenticated" ON public.groups
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = public.groups.id
      AND user_id = (SELECT auth.uid())
    )
  );

-- group_members
DROP POLICY IF EXISTS "group_members_select_authenticated" ON public.group_members;
CREATE POLICY "group_members_select_authenticated" ON public.group_members
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = public.group_members.group_id
      AND gm.user_id = (SELECT auth.uid())
    )
  );

-- transactions
DROP POLICY IF EXISTS "transactions_select_authenticated_unified" ON public.transactions;
DROP POLICY IF EXISTS "transactions_insert_authenticated" ON public.transactions;
DROP POLICY IF EXISTS "transactions_update_authenticated" ON public.transactions;
DROP POLICY IF EXISTS "transactions_delete_authenticated" ON public.transactions;

CREATE POLICY "transactions_select_authenticated_unified" ON public.transactions
  FOR SELECT TO authenticated USING (
    (SELECT auth.uid()) = user_id OR 
    (group_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = public.transactions.group_id
      AND user_id = (SELECT auth.uid())
    ))
  );
CREATE POLICY "transactions_insert_authenticated" ON public.transactions
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "transactions_update_authenticated" ON public.transactions
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "transactions_delete_authenticated" ON public.transactions
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- budgets
DROP POLICY IF EXISTS "budgets_all_authenticated" ON public.budgets;
CREATE POLICY "budgets_all_authenticated" ON public.budgets
  FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id);

-- investments
DROP POLICY IF EXISTS "investments_all_authenticated" ON public.investments;
CREATE POLICY "investments_all_authenticated" ON public.investments
  FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id);

-- portfolios
DROP POLICY IF EXISTS "portfolios_all_authenticated" ON public.portfolios;
CREATE POLICY "portfolios_all_authenticated" ON public.portfolios
  FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id);

-- investment_categories
DROP POLICY IF EXISTS "investment_categories_all_authenticated" ON public.investment_categories;
CREATE POLICY "investment_categories_all_authenticated" ON public.investment_categories
  FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id);

-- credit_cards
DROP POLICY IF EXISTS "credit_cards_all_authenticated" ON public.credit_cards;
CREATE POLICY "credit_cards_all_authenticated" ON public.credit_cards
  FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id);

-- loans
DROP POLICY IF EXISTS "loans_all_authenticated" ON public.loans;
CREATE POLICY "loans_all_authenticated" ON public.loans
  FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id);

-- loan_payments
DROP POLICY IF EXISTS "loan_payments_all_authenticated" ON public.loan_payments;
CREATE POLICY "loan_payments_all_authenticated" ON public.loan_payments
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.loans
      WHERE id = public.loan_payments.loan_id
      AND user_id = (SELECT auth.uid())
    )
  );

-- subscriptions
DROP POLICY IF EXISTS "subscriptions_all_authenticated" ON public.subscriptions;
CREATE POLICY "subscriptions_all_authenticated" ON public.subscriptions
  FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id);

-- subscription_payments
DROP POLICY IF EXISTS "subscription_payments_all_authenticated" ON public.subscription_payments;
CREATE POLICY "subscription_payments_all_authenticated" ON public.subscription_payments
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE id = public.subscription_payments.subscription_id
      AND user_id = (SELECT auth.uid())
    )
  );

-- storage.objects (Avatars)
DROP POLICY IF EXISTS "avatars_select_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "avatars_upsert_authenticated" ON storage.objects;

CREATE POLICY "avatars_select_authenticated" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'avatars');
CREATE POLICY "avatars_upsert_authenticated" ON storage.objects
  FOR ALL TO authenticated WITH CHECK (bucket_id = 'avatars' AND (SELECT auth.uid()) = owner);

-- ==========================================
-- 3. ADDITIONAL PERFORMANCE INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_transactions_group_id ON public.transactions(group_id);
