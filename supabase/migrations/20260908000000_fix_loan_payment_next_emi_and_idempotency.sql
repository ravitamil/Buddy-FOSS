-- Migration: Fix record_loan_payment RPC to advance next_emi_date, enforce idempotency, and assign Debt category to transactions
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS operation_key text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_user_operation_key
  ON public.transactions(user_id, operation_key)
  WHERE operation_key IS NOT NULL;

ALTER TABLE public.loan_payments ADD COLUMN IF NOT EXISTS operation_key text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_loan_payments_loan_operation_key
  ON public.loan_payments(loan_id, operation_key)
  WHERE operation_key IS NOT NULL;

ALTER TABLE public.subscription_payments ADD COLUMN IF NOT EXISTS operation_key text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscription_payments_subscription_operation_key
  ON public.subscription_payments(subscription_id, operation_key)
  WHERE operation_key IS NOT NULL;

CREATE OR REPLACE FUNCTION public.record_loan_payment(
  p_user_id uuid,
  p_loan_id text,
  p_amount numeric,
  p_principal_paid numeric,
  p_interest_paid numeric,
  p_wallet_id uuid DEFAULT NULL::uuid,
  p_payment_method text DEFAULT 'bank'::text,
  p_note text DEFAULT NULL::text,
  p_payment_date timestamp with time zone DEFAULT timezone('utc'::text, now()),
  p_operation_key text DEFAULT NULL::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_loan record;
  v_new_balance numeric;
  v_new_status text;
  v_next_emi timestamp with time zone;
  v_payment_id text;
  v_tx_id text;
  v_existing_tx_id text;
  v_existing_payment_id text;
  v_date timestamp with time zone;
BEGIN
  IF (SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Payment amount must be greater than zero';
  END IF;

  v_date := COALESCE(p_payment_date, timezone('utc'::text, now()));

  -- Idempotency check using p_operation_key
  IF p_operation_key IS NOT NULL THEN
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
        'transaction_id', v_existing_tx_id,
        'next_emi_date', v_loan.next_emi_date
      );
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

  -- Advance next_emi_date based on payment frequency
  v_next_emi := CASE v_loan.payment_frequency
    WHEN 'WEEKLY' THEN GREATEST(COALESCE(v_loan.next_emi_date::timestamptz, v_date), v_date) + interval '1 week'
    WHEN 'MONTHLY' THEN GREATEST(COALESCE(v_loan.next_emi_date::timestamptz, v_date), v_date) + interval '1 month'
    WHEN 'QUARTERLY' THEN GREATEST(COALESCE(v_loan.next_emi_date::timestamptz, v_date), v_date) + interval '3 months'
    WHEN 'YEARLY' THEN GREATEST(COALESCE(v_loan.next_emi_date::timestamptz, v_date), v_date) + interval '1 year'
    ELSE GREATEST(COALESCE(v_loan.next_emi_date::timestamptz, v_date), v_date) + interval '1 month'
  END;

  v_payment_id := (gen_random_uuid())::text;
  v_tx_id := (gen_random_uuid())::text;

  UPDATE public.loans
  SET remaining_amount = v_new_balance,
      status = v_new_status,
      next_emi_date = CASE WHEN v_new_balance = 0 THEN v_loan.next_emi_date ELSE v_next_emi::text END,
      updated_at = timezone('utc'::text, now())
  WHERE id = p_loan_id AND user_id = p_user_id;

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
    operation_key,
    created_at
  ) VALUES (
    v_payment_id,
    p_loan_id,
    p_amount,
    v_date,
    p_principal_paid,
    p_interest_paid,
    'COMPLETED',
    p_payment_method,
    p_note,
    p_operation_key,
    timezone('utc'::text, now())
  );

  INSERT INTO public.transactions (
    id,
    user_id,
    amount,
    description,
    date,
    type,
    category_id,
    loan_id,
    wallet_id,
    notes,
    operation_key,
    created_at,
    updated_at
  ) VALUES (
    v_tx_id,
    p_user_id,
    -ABS(p_amount),
    'Loan Payment: ' || v_loan.name,
    v_date,
    'expense',
    '00000000-0000-0000-0000-000000000211',
    p_loan_id,
    p_wallet_id,
    p_note,
    p_operation_key,
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  );

  IF p_wallet_id IS NOT NULL THEN
    UPDATE public.wallets
    SET balance = balance - ABS(p_amount),
        updated_at = timezone('utc'::text, now())
    WHERE id = p_wallet_id AND user_id = p_user_id;
  END IF;

  RETURN jsonb_build_object(
    'loan_id', p_loan_id,
    'remaining_amount', v_new_balance,
    'status', v_new_status,
    'payment_id', v_payment_id,
    'transaction_id', v_tx_id,
    'next_emi_date', CASE WHEN v_new_balance = 0 THEN v_loan.next_emi_date ELSE v_next_emi::text END
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.record_loan_payment(uuid, text, numeric, numeric, numeric, uuid, text, text, timestamp with time zone, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_loan_payment(uuid, text, numeric, numeric, numeric, uuid, text, text, timestamp with time zone, text) TO authenticated;
