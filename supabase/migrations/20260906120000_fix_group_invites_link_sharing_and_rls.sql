-- Fix group_invites link sharing and eliminate 42501 permission denied for table users
-- 1. Make email nullable and add member_id to associate invites with group member placeholders
ALTER TABLE public.group_invites ALTER COLUMN email DROP NOT NULL;
ALTER TABLE public.group_invites ADD COLUMN IF NOT EXISTS member_id text;

-- 2. Drop legacy policies referencing auth.users directly
DROP POLICY IF EXISTS "group_invites_select_authenticated" ON public.group_invites;
DROP POLICY IF EXISTS "group_invites_update_authenticated" ON public.group_invites;
DROP POLICY IF EXISTS "group_invites_insert_authenticated" ON public.group_invites;

-- 3. Create non-privileged RLS policies using JWT claims and membership helpers
CREATE POLICY "group_invites_select_authenticated" ON public.group_invites
  FOR SELECT TO authenticated
  USING (
    invited_by = (SELECT auth.uid())
    OR is_group_creator(group_id)
    OR is_member_of_group_text(group_id)
    OR (
      email IS NOT NULL
      AND lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

CREATE POLICY "group_invites_insert_authenticated" ON public.group_invites
  FOR INSERT TO authenticated
  WITH CHECK (
    invited_by = (SELECT auth.uid())
    AND (is_group_creator(group_id) OR is_member_of_group_text(group_id))
  );

-- Revoke direct UPDATE on group_invites so changes go through accept_group_invite RPC
REVOKE UPDATE ON TABLE public.group_invites FROM authenticated;

-- 4. Update atomic invite acceptance to support generic share links and placeholder member claiming
CREATE OR REPLACE FUNCTION public.accept_group_invite(p_token text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := (SELECT auth.uid());
  v_user_email text;
  v_invite public.group_invites%ROWTYPE;
  v_display_name text;
  v_avatar_url text;
  v_updated boolean := false;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication is required';
  END IF;

  SELECT lower(email)
  INTO v_user_email
  FROM auth.users
  WHERE id = v_user_id;

  SELECT *
  INTO v_invite
  FROM public.group_invites
  WHERE token = p_token
    AND coalesce(status, 'pending') = 'pending'
    AND expires_at > now()
    AND (
      email IS NULL
      OR email = ''
      OR v_user_email IS NULL
      OR lower(email) = v_user_email
    )
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invite is invalid, expired, or belongs to another account';
  END IF;

  SELECT full_name, avatar_url
  INTO v_display_name, v_avatar_url
  FROM public.profiles
  WHERE id = v_user_id;

  -- 1. If invite is tied to an existing placeholder member, claim it
  IF v_invite.member_id IS NOT NULL THEN
    UPDATE public.group_members
    SET supabase_user_id = v_user_id,
        invite_email = COALESCE(v_user_email, invite_email),
        invite_status = 'accepted',
        display_name = COALESCE(v_display_name, display_name, v_user_email, 'Member'),
        avatar_url = COALESCE(v_avatar_url, avatar_url)
    WHERE group_id = v_invite.group_id
      AND (user_id = v_invite.member_id OR id = v_invite.member_id);
    IF FOUND THEN
      v_updated := true;
    END IF;
  END IF;

  -- 2. If not matched yet, check if there is an existing member with the same email
  IF NOT v_updated AND v_user_email IS NOT NULL THEN
    UPDATE public.group_members
    SET supabase_user_id = v_user_id,
        invite_email = v_user_email,
        invite_status = 'accepted',
        display_name = COALESCE(v_display_name, display_name, v_user_email, 'Member'),
        avatar_url = COALESCE(v_avatar_url, avatar_url)
    WHERE group_id = v_invite.group_id
      AND lower(invite_email) = v_user_email
      AND (supabase_user_id IS NULL OR supabase_user_id = v_user_id);
    IF FOUND THEN
      v_updated := true;
    END IF;
  END IF;

  -- 3. If still not updated, insert/upsert membership for this user
  IF NOT v_updated THEN
    INSERT INTO public.group_members (
      id,
      group_id,
      user_id,
      joined_at,
      supabase_user_id,
      invite_email,
      invite_status,
      display_name,
      avatar_url
    )
    VALUES (
      gen_random_uuid()::text,
      v_invite.group_id,
      v_user_id::text,
      now(),
      v_user_id,
      v_user_email,
      'accepted',
      COALESCE(v_display_name, v_user_email, 'Member'),
      v_avatar_url
    )
    ON CONFLICT (group_id, user_id) DO UPDATE
    SET supabase_user_id = EXCLUDED.supabase_user_id,
        invite_email = COALESCE(EXCLUDED.invite_email, group_members.invite_email),
        invite_status = 'accepted',
        display_name = COALESCE(EXCLUDED.display_name, group_members.display_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, group_members.avatar_url);
  END IF;

  UPDATE public.group_invites
  SET status = 'accepted'
  WHERE id = v_invite.id;

  RETURN v_invite.group_id;
END;
$$;

REVOKE ALL ON FUNCTION public.accept_group_invite(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_group_invite(text) TO authenticated;
