-- Emergency containment for the hosted legacy text-ID schema.
--
-- This migration intentionally does not attempt the UUID reconciliation. It removes
-- unauthenticated mutation/read paths and excessive table privileges while preserving
-- the currently deployed client contracts. The following reconciliation migration must
-- replace the legacy text contracts before the 20260902 feature migrations are deployed.

DO $$
DECLARE
  signature text;
BEGIN
  FOREACH signature IN ARRAY ARRAY[
    'public.calculate_budget_rollover(uuid,uuid)',
    'public.deposit_savings_goal(uuid,text,numeric,uuid,text)',
    'public.get_monthly_financial_summary(uuid,integer,integer)',
    'public.get_spending_by_category(uuid,timestamp with time zone,timestamp with time zone)',
    'public.record_loan_payment(uuid,text,numeric,numeric,numeric,uuid,text,text)',
    'public.is_member_of_group(text)',
    'public.handle_new_user()'
  ] LOOP
    IF to_regprocedure(signature) IS NOT NULL THEN
      EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon', signature);
    END IF;
  END LOOP;
END;
$$;

-- The client still invokes the payment and summary RPCs as an authenticated user.
-- Keeping their grants explicit prevents the default PUBLIC execute privilege returning.
DO $$
DECLARE
  signature text;
BEGIN
  FOREACH signature IN ARRAY ARRAY[
    'public.calculate_budget_rollover(uuid,uuid)',
    'public.deposit_savings_goal(uuid,text,numeric,uuid,text)',
    'public.get_monthly_financial_summary(uuid,integer,integer)',
    'public.get_spending_by_category(uuid,timestamp with time zone,timestamp with time zone)',
    'public.record_loan_payment(uuid,text,numeric,numeric,numeric,uuid,text,text)',
    'public.is_member_of_group(text)',
    'public.is_group_creator(text)',
    'public.is_member_of_group_text(text)'
  ] LOOP
    IF to_regprocedure(signature) IS NOT NULL THEN
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', signature);
    END IF;
  END LOOP;
END;
$$;

-- RLS is not a substitute for table-level privilege minimization. Client roles only
-- need CRUD; TRUNCATE, TRIGGER and REFERENCES are not part of the mobile contract.
REVOKE TRUNCATE, TRIGGER, REFERENCES ON ALL TABLES IN SCHEMA public FROM authenticated;

-- Only a group owner may add or alter membership. A member may remove only their own row.
DROP POLICY IF EXISTS "group_members_insert_authenticated" ON public.group_members;
DROP POLICY IF EXISTS "group_members_update_authenticated" ON public.group_members;
DROP POLICY IF EXISTS "group_members_delete_authenticated" ON public.group_members;

CREATE POLICY "group_members_insert_authenticated" ON public.group_members
  FOR INSERT TO authenticated
  WITH CHECK (is_group_creator(group_id));

CREATE POLICY "group_members_update_authenticated" ON public.group_members
  FOR UPDATE TO authenticated
  USING (is_group_creator(group_id))
  WITH CHECK (is_group_creator(group_id));

CREATE POLICY "group_members_delete_authenticated" ON public.group_members
  FOR DELETE TO authenticated
  USING (
    is_group_creator(group_id)
    OR user_id = ((SELECT auth.uid())::text)
    OR supabase_user_id = (SELECT auth.uid())
  );

-- Invite creation must be attributed to the caller and owned by the group creator.
-- Invite acceptance is intentionally performed only by the identity-bound RPC introduced
-- in the schema reconciliation phase.
DROP POLICY IF EXISTS "group_invites_insert_authenticated" ON public.group_invites;
CREATE POLICY "group_invites_insert_authenticated" ON public.group_invites
  FOR INSERT TO authenticated
  WITH CHECK (
    invited_by = (SELECT auth.uid())
    AND is_group_creator(group_id)
  );
REVOKE UPDATE ON TABLE public.group_invites FROM authenticated;

-- A group creator must not be able to silently transfer group ownership.
DROP POLICY IF EXISTS "groups_update_authenticated" ON public.groups;
CREATE POLICY "groups_update_authenticated" ON public.groups
  FOR UPDATE TO authenticated
  USING (created_by = ((SELECT auth.uid())::text))
  WITH CHECK (created_by = ((SELECT auth.uid())::text));

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
