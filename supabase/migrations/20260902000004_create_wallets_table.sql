-- ==============================================================================
-- Migration: Create public.wallets table
-- Description:
-- Stores user liquid asset accounts (Cash, Bank Accounts, Digital Wallets).
-- Secures with Row Level Security (RLS) and (SELECT auth.uid()) subquery optimization.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.wallets (
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

-- Enable Row Level Security
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- Hardened RLS policies
DROP POLICY IF EXISTS "wallets_all_authenticated" ON public.wallets;
CREATE POLICY "wallets_all_authenticated" ON public.wallets
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Performance Index
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_wallets_user_name
  ON public.wallets(user_id, name);

-- Permissions
REVOKE ALL ON public.wallets FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wallets TO authenticated;
