-- Fix record_loan_payment RPC to support p_payment_date and p_operation_key
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
  v_payment_id text;
  v_tx_id text;
  v_date timestamp with time zone;
BEGIN
  IF (SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT * INTO v_loan
  FROM public.loans
  WHERE id = p_loan_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Loan not found';
  END IF;

  v_date := COALESCE(p_payment_date, timezone('utc'::text, now()));
  v_new_balance := GREATEST(0, v_loan.remaining_amount - p_principal_paid);
  v_new_status := CASE WHEN v_new_balance = 0 THEN 'PAID_OFF' ELSE v_loan.status END;
  v_payment_id := (gen_random_uuid())::text;
  v_tx_id := (gen_random_uuid())::text;

  UPDATE public.loans
  SET remaining_amount = v_new_balance,
      status = v_new_status,
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
    timezone('utc'::text, now())
  );

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
    updated_at
  ) VALUES (
    v_tx_id,
    p_user_id,
    -ABS(p_amount),
    'Loan Payment: ' || v_loan.name,
    v_date,
    'expense',
    p_loan_id,
    p_wallet_id,
    p_note,
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
    'transaction_id', v_tx_id
  );
END;
$function$;

GRANT EXECUTE ON FUNCTION public.record_loan_payment(uuid, text, numeric, numeric, numeric, uuid, text, text, timestamp with time zone, text) TO authenticated;
