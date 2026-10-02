-- Persist rich group split/settlement metadata on transactions
-- This enables deterministic balance reconstruction after app reload/sync.

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS received_by text,
  ADD COLUMN IF NOT EXISTS split_among jsonb,
  ADD COLUMN IF NOT EXISTS split_amounts jsonb,
  ADD COLUMN IF NOT EXISTS split_details jsonb,
  ADD COLUMN IF NOT EXISTS is_settlement boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS settled_debts jsonb,
  ADD COLUMN IF NOT EXISTS settled_debt_amounts jsonb,
  ADD COLUMN IF NOT EXISTS transaction_currency text,
  ADD COLUMN IF NOT EXISTS fx_rate_applied numeric;

UPDATE public.transactions
SET is_settlement = false
WHERE is_settlement IS NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_group_is_settlement
  ON public.transactions(group_id, is_settlement);
