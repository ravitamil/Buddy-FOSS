-- Restore invite acceptance after direct group_invites UPDATE was revoked.
-- The hosted schema still uses text group/member identifiers, so this is deliberately
-- separate from the UUID-versioned acceptance function in the pending reconciliation work.
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
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication is required';
  END IF;

  SELECT lower(email)
  INTO v_user_email
  FROM auth.users
  WHERE id = v_user_id;

  IF v_user_email IS NULL THEN
    RAISE EXCEPTION 'An email-backed account is required to accept an invite';
  END IF;

  SELECT *
  INTO v_invite
  FROM public.group_invites
  WHERE token = p_token
    AND coalesce(status, 'pending') = 'pending'
    AND expires_at > now()
    AND lower(email) = v_user_email
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invite is invalid, expired, or belongs to another account';
  END IF;

  SELECT full_name, avatar_url
  INTO v_display_name, v_avatar_url
  FROM public.profiles
  WHERE id = v_user_id;

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
    v_display_name,
    v_avatar_url
  )
  ON CONFLICT (group_id, user_id) DO UPDATE
  SET supabase_user_id = EXCLUDED.supabase_user_id,
      invite_email = EXCLUDED.invite_email,
      invite_status = 'accepted',
      display_name = EXCLUDED.display_name,
      avatar_url = EXCLUDED.avatar_url;

  UPDATE public.group_invites
  SET status = 'accepted'
  WHERE id = v_invite.id;

  RETURN v_invite.group_id;
END;
$$;

REVOKE ALL ON FUNCTION public.accept_group_invite(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_group_invite(text) TO authenticated;
