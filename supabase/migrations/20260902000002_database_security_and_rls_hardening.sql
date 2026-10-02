-- ==============================================================================
-- Migration: Database Security, Performance & RLS Hardening (Phase 1)
-- Description:
-- 1. Sets explicit search_path = public on all SECURITY DEFINER functions.
-- 2. Revokes execution of internal functions from public/anon.
-- 3. Standardizes all RLS policies to use (SELECT auth.uid()) to avoid per-row re-evaluation.
-- 4. Enforces 'TO authenticated' on all sensitive user policies.
-- 5. Revokes public/anon access on all internal tables.
-- 6. Adds missing covering indexes for foreign keys.
-- ==============================================================================

-- Normalize the group persistence shape before helpers and policies use it.
ALTER TABLE public.groups
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS settings jsonb;

ALTER TABLE public.group_members
  ADD COLUMN IF NOT EXISTS supabase_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS invite_status text NOT NULL DEFAULT 'accepted',
  ADD COLUMN IF NOT EXISTS invite_email text,
  ADD COLUMN IF NOT EXISTS phone text;

ALTER TABLE public.group_members
  DROP CONSTRAINT IF EXISTS group_members_invite_status_check;
ALTER TABLE public.group_members
  ADD CONSTRAINT group_members_invite_status_check
  CHECK (invite_status IN ('pending', 'accepted', 'declined'));

CREATE TABLE IF NOT EXISTS public.group_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  token text NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at timestamp with time zone NOT NULL DEFAULT (timezone('utc'::text, now()) + interval '7 days'),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.group_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name text,
  event_type text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.group_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_activity ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 1. HARDEN SECURITY DEFINER & STORED FUNCTIONS
-- ------------------------------------------------------------------------------

-- is_group_creator
CREATE OR REPLACE FUNCTION public.is_group_creator(target_group_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.groups
    WHERE id = target_group_id
      AND created_by = (SELECT auth.uid())
  );
END;
$$;

-- is_member_of_group_text
CREATE OR REPLACE FUNCTION public.is_member_of_group_text(target_group_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE group_id = target_group_id
      AND (
        supabase_user_id = (SELECT auth.uid())
        OR user_id = ((SELECT auth.uid())::text)
      )
      AND invite_status = 'accepted'
  );
END;
$$;

-- is_group_member
CREATE OR REPLACE FUNCTION public.is_group_member(p_group_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE group_id = p_group_id
      AND (
        supabase_user_id = (SELECT auth.uid())
        OR user_id = ((SELECT auth.uid())::text)
      )
      AND invite_status = 'accepted'
  );
END;
$$;

-- get_user_groups
DROP FUNCTION IF EXISTS public.get_user_groups();
CREATE OR REPLACE FUNCTION public.get_user_groups()
RETURNS TABLE(group_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT gm.group_id
  FROM public.group_members gm
  WHERE (
      gm.supabase_user_id = (SELECT auth.uid())
      OR gm.user_id = ((SELECT auth.uid())::text)
    )
    AND gm.invite_status = 'accepted';
END;
$$;

-- handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;

-- generate_cin_id
CREATE OR REPLACE FUNCTION public.generate_cin_id()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result text := '';
    i integer := 0;
    is_unique boolean := false;
BEGIN
    WHILE NOT is_unique LOOP
        result := '';
        FOR i IN 1..6 LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
        END LOOP;

        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE cin_id = result) THEN
            is_unique := true;
        END IF;
    END LOOP;

    RETURN result;
END;
$$;

-- set_cin_id
CREATE OR REPLACE FUNCTION public.set_cin_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF NEW.cin_id IS NULL THEN
        NEW.cin_id := public.generate_cin_id();
    END IF;
    RETURN NEW;
END;
$$;

-- deactivate_other_user_budgets
CREATE OR REPLACE FUNCTION public.deactivate_other_user_budgets()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.is_active THEN
    UPDATE public.budgets
    SET is_active = false,
        updated_at = timezone('utc'::text, now())
    WHERE user_id = NEW.user_id
      AND id <> NEW.id
      AND is_active;
  END IF;

  RETURN NEW;
END;
$$;

-- Revoke function executions from anon/public
REVOKE EXECUTE ON FUNCTION public.is_group_creator(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_member_of_group_text(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_group_member(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_groups() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_member_of_group(uuid) FROM PUBLIC, anon;

-- Older environments can still contain text overloads. Keep them unreachable
-- while the UUID signatures become the only helpers used by current policies.
DO $$
BEGIN
  IF to_regprocedure('public.is_group_creator(text)') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.is_group_creator(text) FROM PUBLIC, anon';
  END IF;
  IF to_regprocedure('public.is_member_of_group_text(text)') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.is_member_of_group_text(text) FROM PUBLIC, anon';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_group_creator(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_member_of_group_text(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_groups() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_member_of_group(uuid) TO authenticated;

-- ------------------------------------------------------------------------------
-- 2. SECURE & STANDARDIZE RLS POLICIES (INITPLAN & ROLE RESTRICTIONS)
-- ------------------------------------------------------------------------------

-- GROUPS
DROP POLICY IF EXISTS "groups_select_v4" ON public.groups;
DROP POLICY IF EXISTS "groups_insert_v4" ON public.groups;
DROP POLICY IF EXISTS "groups_update_v4" ON public.groups;
DROP POLICY IF EXISTS "groups_delete_v4" ON public.groups;
DROP POLICY IF EXISTS "groups_select_authenticated" ON public.groups;
DROP POLICY IF EXISTS "groups_insert_authenticated" ON public.groups;
DROP POLICY IF EXISTS "groups_update_authenticated" ON public.groups;
DROP POLICY IF EXISTS "groups_delete_authenticated" ON public.groups;

CREATE POLICY "groups_select_authenticated" ON public.groups
  FOR SELECT TO authenticated
  USING (
    created_by = (SELECT auth.uid())
    OR is_member_of_group_text(id)
  );

CREATE POLICY "groups_insert_authenticated" ON public.groups
  FOR INSERT TO authenticated
  WITH CHECK (created_by = (SELECT auth.uid()));

CREATE POLICY "groups_update_authenticated" ON public.groups
  FOR UPDATE TO authenticated
  USING (created_by = (SELECT auth.uid()))
  WITH CHECK (created_by = (SELECT auth.uid()));

CREATE POLICY "groups_delete_authenticated" ON public.groups
  FOR DELETE TO authenticated
  USING (created_by = (SELECT auth.uid()));

-- GROUP MEMBERS
DROP POLICY IF EXISTS "group_members_select_v4" ON public.group_members;
DROP POLICY IF EXISTS "group_members_insert_v4" ON public.group_members;
DROP POLICY IF EXISTS "group_members_update_v4" ON public.group_members;
DROP POLICY IF EXISTS "group_members_delete_v4" ON public.group_members;
DROP POLICY IF EXISTS "group_members_select_authenticated" ON public.group_members;
DROP POLICY IF EXISTS "group_members_insert_authenticated" ON public.group_members;
DROP POLICY IF EXISTS "group_members_update_authenticated" ON public.group_members;
DROP POLICY IF EXISTS "group_members_delete_authenticated" ON public.group_members;

CREATE POLICY "group_members_select_authenticated" ON public.group_members
  FOR SELECT TO authenticated
  USING (
    is_group_creator(group_id)
    OR user_id = ((SELECT auth.uid())::text)
    OR supabase_user_id = (SELECT auth.uid())
    OR is_member_of_group_text(group_id)
  );

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

-- GROUP INVITES
DROP POLICY IF EXISTS "group_invites_select_v4" ON public.group_invites;
DROP POLICY IF EXISTS "group_invites_insert_v4" ON public.group_invites;
DROP POLICY IF EXISTS "group_invites_update_v4" ON public.group_invites;
DROP POLICY IF EXISTS "group_invites_select_authenticated" ON public.group_invites;
DROP POLICY IF EXISTS "group_invites_insert_authenticated" ON public.group_invites;
DROP POLICY IF EXISTS "group_invites_update_authenticated" ON public.group_invites;

CREATE POLICY "group_invites_select_authenticated" ON public.group_invites
  FOR SELECT TO authenticated
  USING (
    invited_by = (SELECT auth.uid())
    OR email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
    OR is_member_of_group_text(group_id)
  );

CREATE POLICY "group_invites_insert_authenticated" ON public.group_invites
  FOR INSERT TO authenticated
  WITH CHECK (
    invited_by = (SELECT auth.uid())
    AND (is_member_of_group_text(group_id) OR is_group_creator(group_id))
  );

CREATE POLICY "group_invites_update_authenticated" ON public.group_invites
  FOR UPDATE TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
    OR invited_by = (SELECT auth.uid())
  )
  WITH CHECK (
    email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
    OR invited_by = (SELECT auth.uid())
  );

-- GROUP ACTIVITY
DROP POLICY IF EXISTS "group_activity_select_v4" ON public.group_activity;
DROP POLICY IF EXISTS "group_activity_insert_v4" ON public.group_activity;
DROP POLICY IF EXISTS "group_activity_select_authenticated" ON public.group_activity;
DROP POLICY IF EXISTS "group_activity_insert_authenticated" ON public.group_activity;

CREATE POLICY "group_activity_select_authenticated" ON public.group_activity
  FOR SELECT TO authenticated
  USING (is_member_of_group_text(group_id));

CREATE POLICY "group_activity_insert_authenticated" ON public.group_activity
  FOR INSERT TO authenticated
  WITH CHECK (
    is_member_of_group_text(group_id)
    AND actor_user_id = (SELECT auth.uid())
  );

-- TRANSACTIONS
DROP POLICY IF EXISTS "transactions_select_authenticated" ON public.transactions;
DROP POLICY IF EXISTS "transactions_select_authenticated_unified" ON public.transactions;
DROP POLICY IF EXISTS "transactions_insert_authenticated" ON public.transactions;
DROP POLICY IF EXISTS "transactions_update_authenticated" ON public.transactions;
DROP POLICY IF EXISTS "transactions_delete_authenticated" ON public.transactions;

CREATE POLICY "transactions_select_authenticated" ON public.transactions
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "transactions_insert_authenticated" ON public.transactions
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "transactions_update_authenticated" ON public.transactions
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "transactions_delete_authenticated" ON public.transactions
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- NUDGE LOG
DROP POLICY IF EXISTS "Users can insert their own nudge logs" ON public.nudge_log;
DROP POLICY IF EXISTS "Users can read their own nudge logs" ON public.nudge_log;
DROP POLICY IF EXISTS "nudge_log_select_authenticated" ON public.nudge_log;
DROP POLICY IF EXISTS "nudge_log_insert_authenticated" ON public.nudge_log;

CREATE POLICY "nudge_log_select_authenticated" ON public.nudge_log
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = nudger_id);

CREATE POLICY "nudge_log_insert_authenticated" ON public.nudge_log
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = nudger_id);

-- PROFILES
DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_authenticated" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_authenticated" ON public.profiles;

CREATE POLICY "profiles_select_authenticated" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "profiles_insert_authenticated" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "profiles_update_authenticated" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- ------------------------------------------------------------------------------
-- 3. REVOKE ANONYMOUS TABLE PERMISSIONS
-- ------------------------------------------------------------------------------

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE CREATE ON SCHEMA public FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.feature_controls TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
REVOKE UPDATE ON TABLE public.group_invites FROM authenticated;

-- ------------------------------------------------------------------------------
-- 4. ADD COVERING INDEXES FOR UNINDEXED FOREIGN KEYS
-- ------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_group_activity_actor_user_id ON public.group_activity(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_group_invites_invited_by ON public.group_invites(invited_by);
CREATE INDEX IF NOT EXISTS idx_nudge_log_debtor_id ON public.nudge_log(debtor_id);
CREATE INDEX IF NOT EXISTS idx_nudge_log_group_id ON public.nudge_log(group_id);
