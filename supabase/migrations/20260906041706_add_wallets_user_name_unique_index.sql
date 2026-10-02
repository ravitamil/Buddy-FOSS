-- ==============================================================================
-- Migration: Add unique constraint and index on wallets(user_id, name)
-- Description:
-- Fixes ON CONFLICT specification error (code: 42P10) when seeding or upserting wallets.
-- ==============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_wallets_user_name
  ON public.wallets(user_id, name);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'wallets_user_id_name_key'
  ) THEN
    ALTER TABLE public.wallets
      ADD CONSTRAINT wallets_user_id_name_key UNIQUE USING INDEX idx_wallets_user_name;
  END IF;
END $$;
