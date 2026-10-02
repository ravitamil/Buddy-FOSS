-- Keep wallet balances synchronized with every linked ledger mutation.
CREATE OR REPLACE FUNCTION public.apply_wallet_transaction_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_delta numeric;
  v_new_delta numeric;
BEGIN
  IF TG_OP IN ('UPDATE', 'DELETE') AND OLD.wallet_id IS NOT NULL THEN
    v_old_delta := CASE
      WHEN OLD.type = 'expense' THEN -ABS(OLD.amount)
      WHEN OLD.type = 'income' THEN ABS(OLD.amount)
      ELSE OLD.amount
    END;

    UPDATE public.wallets
    SET balance = balance - v_old_delta,
        updated_at = timezone('utc'::text, now())
    WHERE id = OLD.wallet_id AND user_id = OLD.user_id;
  END IF;

  IF TG_OP IN ('INSERT', 'UPDATE') AND NEW.wallet_id IS NOT NULL THEN
    v_new_delta := CASE
      WHEN NEW.type = 'expense' THEN -ABS(NEW.amount)
      WHEN NEW.type = 'income' THEN ABS(NEW.amount)
      ELSE NEW.amount
    END;

    UPDATE public.wallets
    SET balance = balance + v_new_delta,
        updated_at = timezone('utc'::text, now())
    WHERE id = NEW.wallet_id AND user_id = NEW.user_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Wallet not found or does not belong to the transaction owner';
    END IF;
  END IF;

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

DROP TRIGGER IF EXISTS transactions_apply_wallet_balance ON public.transactions;
CREATE TRIGGER transactions_apply_wallet_balance
  AFTER INSERT OR UPDATE OF amount, type, wallet_id, user_id OR DELETE
  ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.apply_wallet_transaction_balance();

REVOKE ALL ON FUNCTION public.apply_wallet_transaction_balance() FROM PUBLIC, anon, authenticated;
