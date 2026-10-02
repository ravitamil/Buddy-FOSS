-- Add feature linkage columns to transactions table
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS loan_id uuid REFERENCES public.loans(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS savings_goal_id uuid REFERENCES public.savings_goals(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tags jsonb DEFAULT '[]'::jsonb;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_loan_id ON public.transactions(loan_id);
CREATE INDEX IF NOT EXISTS idx_transactions_subscription_id ON public.transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_transactions_savings_goal_id ON public.transactions(savings_goal_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);
