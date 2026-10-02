-- Close post-containment authorization gaps in the hosted legacy text-ID schema.
-- A full UUID/RPC reconciliation still follows; these rules preserve the current client contract
-- while preventing self-service entitlement escalation and cross-group ledger injection.

-- is_pro_override is reserved for a future server-side billing/admin authority. Clients can update
-- their own profile fields, but cannot write the entitlement authority field.
REVOKE UPDATE ON TABLE public.profiles FROM authenticated;
GRANT UPDATE (
  id,
  email,
  full_name,
  avatar_url,
  phone_number,
  first_name,
  last_name,
  is_onboarding_complete,
  currency,
  language,
  theme,
  notification_settings,
  date_of_birth,
  expo_push_token,
  updated_at
) ON TABLE public.profiles TO authenticated;

DROP POLICY IF EXISTS "profiles_update_authenticated" ON public.profiles;
CREATE POLICY "profiles_update_authenticated" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- An owner or payer may update an existing transaction only when its resulting group is one they
-- belong to (or own). A client may create only its own transaction under the same group boundary.
DROP POLICY IF EXISTS "transactions_insert_authenticated" ON public.transactions;
CREATE POLICY "transactions_insert_authenticated" ON public.transactions
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND (
      group_id IS NULL
      OR is_member_of_group(group_id)
      OR is_group_creator(group_id)
    )
  );

DROP POLICY IF EXISTS "transactions_update_authenticated" ON public.transactions;
CREATE POLICY "transactions_update_authenticated" ON public.transactions
  FOR UPDATE TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR paid_by = ((SELECT auth.uid())::text)
    OR (group_id IS NOT NULL AND is_group_creator(group_id))
  )
  WITH CHECK (
    (
      user_id = (SELECT auth.uid())
      OR paid_by = ((SELECT auth.uid())::text)
      OR (group_id IS NOT NULL AND is_group_creator(group_id))
    )
    AND (
      group_id IS NULL
      OR is_member_of_group(group_id)
      OR is_group_creator(group_id)
    )
  );
