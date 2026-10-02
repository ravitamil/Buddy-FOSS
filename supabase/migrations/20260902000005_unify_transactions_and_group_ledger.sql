-- ==============================================================================
-- Migration: Unify Transactions and Group Ledger
-- Description:
-- Consolidates personal and group transactions into a single public.transactions table.
-- Migrates all existing group_transactions data and drops public.group_transactions.
-- Establishes unified group-aware Row Level Security (RLS) policies.
-- ==============================================================================

-- 0. Ensure the canonical UUID membership helper exists
CREATE OR REPLACE FUNCTION public.is_member_of_group(target_group_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

REVOKE ALL ON FUNCTION public.is_member_of_group(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_member_of_group(uuid) TO authenticated;

-- 1. Ensure all group, split, and linkage columns exist on public.transactions
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS paid_by text,
  ADD COLUMN IF NOT EXISTS received_by text[],
  ADD COLUMN IF NOT EXISTS split_method text,
  ADD COLUMN IF NOT EXISTS split_among text[],
  ADD COLUMN IF NOT EXISTS split_amounts jsonb,
  ADD COLUMN IF NOT EXISTS split_details jsonb,
  ADD COLUMN IF NOT EXISTS is_settlement boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS settled_debts text[],
  ADD COLUMN IF NOT EXISTS settled_debt_amounts jsonb,
  ADD COLUMN IF NOT EXISTS fx_rate_applied numeric,
  ADD COLUMN IF NOT EXISTS loan_id uuid REFERENCES public.loans(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS savings_goal_id uuid REFERENCES public.savings_goals(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS wallet_id uuid REFERENCES public.wallets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tags jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS operation_key text;

-- 2. Migrate existing group_transactions rows into transactions (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'group_transactions') THEN
    INSERT INTO public.transactions (
      id,
      user_id,
      amount,
      description,
      category_id,
      date,
      type,
      group_id,
      paid_by,
      received_by,
      split_method,
      split_among,
      split_amounts,
      split_details,
      is_settlement,
      settled_debts,
      settled_debt_amounts,
      receipt_url,
      receipt_urls,
      notes,
      transaction_currency,
      fx_rate_applied,
      is_recurring,
      recurrence_frequency,
      created_at,
      updated_at
    )
    SELECT
      gt.id,
      CASE
        WHEN gt.user_id::text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
          THEN gt.user_id::text::uuid
        ELSE g.created_by
      END,
      gt.amount,
      gt.description,
      gt.category_id,
      gt.date,
      gt.type,
      gt.group_id,
      gt.paid_by,
      gt.received_by,
      gt.split_method,
      gt.split_among,
      gt.split_amounts,
      gt.split_details,
      COALESCE(gt.is_settlement, false),
      gt.settled_debts,
      gt.settled_debt_amounts,
      gt.receipt_url,
      COALESCE(gt.receipt_urls, '{}'::text[]),
      gt.notes,
      gt.transaction_currency,
      gt.fx_rate_applied,
      COALESCE(gt.is_recurring, false),
      gt.recurrence_frequency,
      gt.created_at,
      COALESCE(gt.updated_at, gt.created_at)
    FROM public.group_transactions gt
    JOIN public.groups g ON g.id = gt.group_id
    WHERE CASE
      WHEN gt.user_id::text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
        THEN gt.user_id::text::uuid
      ELSE g.created_by
    END IS NOT NULL
    ON CONFLICT (id) DO NOTHING;

    -- Drop the redundant group_transactions table
    DROP TABLE public.group_transactions CASCADE;
  END IF;
END $$;

-- 3. Hardened RLS Policies on public.transactions
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

DROP TRIGGER IF EXISTS transactions_keep_owner ON public.transactions;
CREATE TRIGGER transactions_keep_owner
  BEFORE UPDATE OF user_id ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_transaction_owner_change();

REVOKE ALL ON FUNCTION public.prevent_transaction_owner_change() FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "transactions_select_authenticated" ON public.transactions;
DROP POLICY IF EXISTS "transactions_select_authenticated_unified" ON public.transactions;
CREATE POLICY "transactions_select_authenticated_unified" ON public.transactions
  FOR SELECT TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR (group_id IS NOT NULL AND is_member_of_group(group_id))
  );

DROP POLICY IF EXISTS "transactions_insert_authenticated" ON public.transactions;
CREATE POLICY "transactions_insert_authenticated" ON public.transactions
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND (group_id IS NULL OR is_member_of_group(group_id))
  );

DROP POLICY IF EXISTS "transactions_update_authenticated" ON public.transactions;
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

DROP POLICY IF EXISTS "transactions_delete_authenticated" ON public.transactions;
CREATE POLICY "transactions_delete_authenticated" ON public.transactions
  FOR DELETE TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR paid_by = ((SELECT auth.uid())::text)
    OR (group_id IS NOT NULL AND is_group_creator(group_id))
  );

-- 4. Covering Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_group_id ON public.transactions(group_id);
CREATE INDEX IF NOT EXISTS idx_transactions_paid_by ON public.transactions(paid_by);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON public.transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_user_operation_key
  ON public.transactions(user_id, operation_key)
  WHERE operation_key IS NOT NULL;

-- 5. Permissions
REVOKE ALL ON public.transactions FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
