-- ==============================================================================
-- Migration: Atomic Payments and Savings RPCs
-- Description:
-- Adds category and notes fields to public.savings_goals.
-- Creates atomic stored procedures for loan EMI payments and savings goal deposits.
-- ==============================================================================

-- 1. Enhance savings_goals table columns
ALTER TABLE public.savings_goals
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS is_completed boolean DEFAULT false;

ALTER TABLE public.loan_payments
  ADD COLUMN IF NOT EXISTS operation_key text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_loan_payments_loan_operation_key
  ON public.loan_payments(loan_id, operation_key)
  WHERE operation_key IS NOT NULL;

-- 2. Atomic Function: Record Loan Payment
CREATE OR REPLACE FUNCTION public.record_loan_payment(
  p_user_id uuid,
  p_loan_id uuid,
  p_amount numeric,
  p_principal_paid numeric,
  p_interest_paid numeric,
  p_payment_date timestamp with time zone DEFAULT timezone('utc'::text, now()),
  p_wallet_id uuid DEFAULT NULL,
  p_payment_method text DEFAULT 'bank',
  p_note text DEFAULT NULL,
  p_operation_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_loan record;
  v_new_balance numeric;
  v_new_status text;
  v_payment_id uuid;
  v_tx_id uuid;
  v_existing_tx_id uuid;
  v_existing_payment_id uuid;
  v_wallet_id uuid;
BEGIN
  IF (SELECT auth.uid()) IS NULL OR (SELECT auth.uid()) IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  IF p_amount <= 0 OR p_principal_paid < 0 OR p_interest_paid < 0 THEN
    RAISE EXCEPTION 'Payment amounts must be positive';
  END IF;

  IF ABS((p_principal_paid + p_interest_paid) - p_amount) > 0.01 THEN
    RAISE EXCEPTION 'Principal and interest must equal the payment amount';
  END IF;

  IF p_operation_key IS NOT NULL THEN
    PERFORM pg_advisory_xact_lock(
      hashtextextended(p_user_id::text || ':loan-payment:' || p_operation_key, 0)
    );

    SELECT id INTO v_existing_tx_id
    FROM public.transactions
    WHERE user_id = p_user_id
      AND operation_key = p_operation_key
      AND loan_id = p_loan_id;

    IF FOUND THEN
      SELECT id INTO v_existing_payment_id
      FROM public.loan_payments
      WHERE loan_id = p_loan_id
        AND operation_key = p_operation_key;

      SELECT * INTO v_loan
      FROM public.loans
      WHERE id = p_loan_id AND user_id = p_user_id;

      RETURN jsonb_build_object(
        'loan_id', p_loan_id,
        'remaining_amount', v_loan.remaining_amount,
        'status', v_loan.status,
        'payment_id', v_existing_payment_id,
        'transaction_id', v_existing_tx_id
      );
    END IF;
  END IF;

  IF p_wallet_id IS NOT NULL THEN
    SELECT id INTO v_wallet_id
    FROM public.wallets
    WHERE id = p_wallet_id AND user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Wallet not found';
    END IF;
  END IF;

  SELECT * INTO v_loan
  FROM public.loans
  WHERE id = p_loan_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Loan not found';
  END IF;

  v_new_balance := GREATEST(0, v_loan.remaining_amount - p_principal_paid);
  v_new_status := CASE WHEN v_new_balance = 0 THEN 'CLOSED' ELSE v_loan.status END;
  v_payment_id := gen_random_uuid();
  v_tx_id := gen_random_uuid();

  -- 1. Update Loan
  UPDATE public.loans
  SET remaining_amount = v_new_balance,
      status = v_new_status,
      updated_at = timezone('utc'::text, now())
  WHERE id = p_loan_id AND user_id = p_user_id;

  -- 2. Insert Loan Payment
  INSERT INTO public.loan_payments (
    id,
    loan_id,
    amount,
    date,
    principal_paid,
    interest_paid,
    status,
    method,
    note,
    created_at,
    operation_key
  ) VALUES (
    v_payment_id,
    p_loan_id,
    p_amount,
    p_payment_date,
    p_principal_paid,
    p_interest_paid,
    'PAID',
    p_payment_method,
    p_note,
    timezone('utc'::text, now()),
    p_operation_key
  );

  -- 3. Insert Transaction Ledger Entry
  INSERT INTO public.transactions (
    id,
    user_id,
    amount,
    description,
    date,
    type,
    loan_id,
    wallet_id,
    notes,
    created_at,
    updated_at,
    operation_key
  ) VALUES (
    v_tx_id,
    p_user_id,
    -ABS(p_amount),
    'Loan Payment: ' || v_loan.name,
    p_payment_date,
    'expense',
    p_loan_id,
    p_wallet_id,
    p_note,
    timezone('utc'::text, now()),
    timezone('utc'::text, now()),
    p_operation_key
  );

  RETURN jsonb_build_object(
    'loan_id', p_loan_id,
    'remaining_amount', v_new_balance,
    'status', v_new_status,
    'payment_id', v_payment_id,
    'transaction_id', v_tx_id
  );
END;
$$;

-- 3. Atomic Function: Deposit to Savings Goal
CREATE OR REPLACE FUNCTION public.deposit_savings_goal(
  p_user_id uuid,
  p_goal_id uuid,
  p_amount numeric,
  p_wallet_id uuid DEFAULT NULL,
  p_note text DEFAULT NULL,
  p_operation_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_goal record;
  v_new_amount numeric;
  v_is_completed boolean;
  v_tx_id uuid;
  v_existing_tx_id uuid;
  v_wallet_id uuid;
BEGIN
  IF (SELECT auth.uid()) IS NULL OR (SELECT auth.uid()) IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Deposit amount must be positive';
  END IF;

  IF p_operation_key IS NOT NULL THEN
    PERFORM pg_advisory_xact_lock(
      hashtextextended(p_user_id::text || ':savings-deposit:' || p_operation_key, 0)
    );

    SELECT id INTO v_existing_tx_id
    FROM public.transactions
    WHERE user_id = p_user_id
      AND operation_key = p_operation_key
      AND savings_goal_id = p_goal_id;

    IF FOUND THEN
      SELECT * INTO v_goal
      FROM public.savings_goals
      WHERE id = p_goal_id AND user_id = p_user_id;

      RETURN jsonb_build_object(
        'goal_id', p_goal_id,
        'current_amount', v_goal.current_amount,
        'is_completed', v_goal.is_completed,
        'transaction_id', v_existing_tx_id
      );
    END IF;
  END IF;

  IF p_wallet_id IS NOT NULL THEN
    SELECT id INTO v_wallet_id
    FROM public.wallets
    WHERE id = p_wallet_id AND user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Wallet not found';
    END IF;
  END IF;

  SELECT * INTO v_goal
  FROM public.savings_goals
  WHERE id = p_goal_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Savings goal not found';
  END IF;

  v_new_amount := COALESCE(v_goal.current_amount, 0) + ABS(p_amount);
  v_is_completed := v_new_amount >= v_goal.target_amount;
  v_tx_id := gen_random_uuid();

  -- 1. Update Savings Goal
  UPDATE public.savings_goals
  SET current_amount = v_new_amount,
      is_completed = v_is_completed,
      updated_at = timezone('utc'::text, now())
  WHERE id = p_goal_id AND user_id = p_user_id;

  -- 2. Insert Transaction Ledger Entry
  INSERT INTO public.transactions (
    id,
    user_id,
    amount,
    description,
    date,
    type,
    savings_goal_id,
    wallet_id,
    notes,
    created_at,
    updated_at,
    operation_key
  ) VALUES (
    v_tx_id,
    p_user_id,
    -ABS(p_amount),
    'Savings Goal Deposit: ' || v_goal.name,
    timezone('utc'::text, now()),
    'expense',
    p_goal_id,
    p_wallet_id,
    p_note,
    timezone('utc'::text, now()),
    timezone('utc'::text, now()),
    p_operation_key
  );

  RETURN jsonb_build_object(
    'goal_id', p_goal_id,
    'current_amount', v_new_amount,
    'is_completed', v_is_completed,
    'transaction_id', v_tx_id
  );
END;
$$;

-- 4. Permissions
REVOKE ALL ON FUNCTION public.record_loan_payment(uuid, uuid, numeric, numeric, numeric, timestamp with time zone, uuid, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_loan_payment(uuid, uuid, numeric, numeric, numeric, timestamp with time zone, uuid, text, text, text) TO authenticated;

REVOKE ALL ON FUNCTION public.deposit_savings_goal(uuid, uuid, numeric, uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.deposit_savings_goal(uuid, uuid, numeric, uuid, text, text) TO authenticated;
