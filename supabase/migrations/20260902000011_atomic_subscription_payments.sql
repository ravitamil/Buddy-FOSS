-- Keep subscription payment history, billing schedule, and the transaction ledger
-- consistent in one database transaction.

ALTER TABLE public.subscription_payments
  ADD COLUMN IF NOT EXISTS transaction_id uuid REFERENCES public.transactions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS operation_key text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscription_payments_subscription_operation_key
  ON public.subscription_payments(subscription_id, operation_key)
  WHERE operation_key IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscription_payments_transaction_id
  ON public.subscription_payments(transaction_id)
  WHERE transaction_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.record_subscription_payment(
  p_user_id uuid,
  p_subscription_id uuid,
  p_amount numeric,
  p_payment_date timestamp with time zone,
  p_status text DEFAULT 'PAID',
  p_payment_method text DEFAULT 'manual',
  p_note text DEFAULT NULL,
  p_wallet_id uuid DEFAULT NULL,
  p_operation_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_subscription record;
  v_payment_id uuid;
  v_transaction_id uuid;
  v_existing_payment record;
  v_next_billing timestamp with time zone;
BEGIN
  IF (SELECT auth.uid()) IS NULL OR (SELECT auth.uid()) IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Payment amount must be positive';
  END IF;

  IF p_status NOT IN ('PAID', 'PENDING', 'FAILED', 'PARTIAL') THEN
    RAISE EXCEPTION 'Unsupported payment status';
  END IF;

  IF p_operation_key IS NOT NULL THEN
    PERFORM pg_advisory_xact_lock(
      hashtextextended(p_user_id::text || ':subscription-payment:' || p_operation_key, 0)
    );

    SELECT sp.id, sp.transaction_id, s.next_billing_date INTO v_existing_payment
    FROM public.subscription_payments sp
    JOIN public.subscriptions s ON s.id = sp.subscription_id
    WHERE sp.subscription_id = p_subscription_id
      AND sp.operation_key = p_operation_key
      AND s.user_id = p_user_id;

    IF FOUND THEN
      RETURN jsonb_build_object(
        'subscription_id', p_subscription_id,
        'payment_id', v_existing_payment.id,
        'transaction_id', v_existing_payment.transaction_id,
        'next_billing_date', v_existing_payment.next_billing_date
      );
    END IF;
  END IF;

  SELECT * INTO v_subscription
  FROM public.subscriptions
  WHERE id = p_subscription_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Subscription not found';
  END IF;

  IF p_wallet_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.wallets WHERE id = p_wallet_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;

  v_payment_id := gen_random_uuid();
  v_transaction_id := CASE WHEN p_status = 'PAID' THEN gen_random_uuid() ELSE NULL END;

  IF v_transaction_id IS NOT NULL THEN
    INSERT INTO public.transactions (
      id, user_id, amount, description, date, type, subscription_id,
      wallet_id, notes, operation_key, created_at, updated_at
    ) VALUES (
      v_transaction_id,
      p_user_id,
      -ABS(p_amount),
      'Subscription Payment: ' || v_subscription.name,
      p_payment_date,
      'expense',
      p_subscription_id,
      p_wallet_id,
      p_note,
      p_operation_key,
      timezone('utc'::text, now()),
      timezone('utc'::text, now())
    );
  END IF;

  INSERT INTO public.subscription_payments (
    id, subscription_id, amount, date, status, method, note,
    transaction_id, operation_key, created_at
  ) VALUES (
    v_payment_id, p_subscription_id, p_amount, p_payment_date, p_status,
    p_payment_method, p_note, v_transaction_id, p_operation_key,
    timezone('utc'::text, now())
  );

  IF p_status = 'PAID' THEN
    v_next_billing := CASE v_subscription.billing_cycle
      WHEN 'weekly' THEN GREATEST(v_subscription.next_billing_date, p_payment_date) + interval '1 week'
      WHEN 'monthly' THEN GREATEST(v_subscription.next_billing_date, p_payment_date) + interval '1 month'
      WHEN 'quarterly' THEN GREATEST(v_subscription.next_billing_date, p_payment_date) + interval '3 months'
      WHEN 'yearly' THEN GREATEST(v_subscription.next_billing_date, p_payment_date) + interval '1 year'
      ELSE v_subscription.next_billing_date
    END;

    UPDATE public.subscriptions
    SET next_billing_date = v_next_billing,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_subscription_id AND user_id = p_user_id;
  END IF;

  RETURN jsonb_build_object(
    'subscription_id', p_subscription_id,
    'payment_id', v_payment_id,
    'transaction_id', v_transaction_id,
    'next_billing_date', v_next_billing
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_subscription_payment(
  p_user_id uuid,
  p_subscription_id uuid,
  p_payment_id uuid,
  p_amount numeric,
  p_payment_date timestamp with time zone,
  p_status text,
  p_payment_method text,
  p_note text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction_id uuid;
  v_subscription_name text;
BEGIN
  IF (SELECT auth.uid()) IS NULL OR (SELECT auth.uid()) IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  IF p_amount <= 0 OR p_status NOT IN ('PAID', 'PENDING', 'FAILED', 'PARTIAL') THEN
    RAISE EXCEPTION 'Invalid payment';
  END IF;

  SELECT sp.transaction_id, s.name INTO v_transaction_id, v_subscription_name
  FROM public.subscription_payments sp
  JOIN public.subscriptions s ON s.id = sp.subscription_id
  WHERE sp.id = p_payment_id
    AND sp.subscription_id = p_subscription_id
    AND s.user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Subscription payment not found';
  END IF;

  UPDATE public.subscription_payments
  SET amount = p_amount,
      date = p_payment_date,
      status = p_status,
      method = p_payment_method,
      note = p_note
  WHERE id = p_payment_id;

  IF v_transaction_id IS NOT NULL THEN
    IF p_status = 'PAID' THEN
      UPDATE public.transactions
      SET amount = -ABS(p_amount),
          date = p_payment_date,
          notes = p_note,
          updated_at = timezone('utc'::text, now())
      WHERE id = v_transaction_id AND user_id = p_user_id;
    ELSE
      DELETE FROM public.transactions
      WHERE id = v_transaction_id AND user_id = p_user_id;

      UPDATE public.subscription_payments
      SET transaction_id = NULL
      WHERE id = p_payment_id;
    END IF;
  ELSIF p_status = 'PAID' THEN
    INSERT INTO public.transactions (
      id, user_id, amount, description, date, type, subscription_id, notes,
      created_at, updated_at
    ) VALUES (
      gen_random_uuid(), p_user_id, -ABS(p_amount),
      'Subscription Payment: ' || v_subscription_name, p_payment_date,
      'expense', p_subscription_id, p_note,
      timezone('utc'::text, now()), timezone('utc'::text, now())
    ) RETURNING id INTO v_transaction_id;

    UPDATE public.subscription_payments
    SET transaction_id = v_transaction_id
    WHERE id = p_payment_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_subscription_payment(
  p_user_id uuid,
  p_subscription_id uuid,
  p_payment_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction_id uuid;
BEGIN
  IF (SELECT auth.uid()) IS NULL OR (SELECT auth.uid()) IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT sp.transaction_id INTO v_transaction_id
  FROM public.subscription_payments sp
  JOIN public.subscriptions s ON s.id = sp.subscription_id
  WHERE sp.id = p_payment_id
    AND sp.subscription_id = p_subscription_id
    AND s.user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Subscription payment not found';
  END IF;

  DELETE FROM public.subscription_payments WHERE id = p_payment_id;
  DELETE FROM public.transactions WHERE id = v_transaction_id AND user_id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.record_subscription_payment(uuid, uuid, numeric, timestamp with time zone, text, text, text, uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.update_subscription_payment(uuid, uuid, uuid, numeric, timestamp with time zone, text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.delete_subscription_payment(uuid, uuid, uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.record_subscription_payment(uuid, uuid, numeric, timestamp with time zone, text, text, text, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_subscription_payment(uuid, uuid, uuid, numeric, timestamp with time zone, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_subscription_payment(uuid, uuid, uuid) TO authenticated;
