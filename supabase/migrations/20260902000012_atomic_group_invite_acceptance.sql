-- Accepting an invite changes both the invite and membership records. Keep the
-- transition atomic and bind it to the authenticated user's verified email.
CREATE OR REPLACE FUNCTION public.accept_group_invite(p_token text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := (SELECT auth.uid());
  v_user_email text;
  v_invite record;
  v_profile_name text;
  v_profile_avatar text;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = v_user_id;

  IF v_user_email IS NULL THEN
    RAISE EXCEPTION 'Authenticated user has no verified email';
  END IF;

  SELECT * INTO v_invite
  FROM public.group_invites
  WHERE token = p_token
    AND status IN ('pending', 'accepted')
    AND expires_at >= timezone('utc'::text, now())
    AND lower(email) = lower(v_user_email)
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invite not found, expired, or assigned to another user';
  END IF;

  SELECT full_name, avatar_url INTO v_profile_name, v_profile_avatar
  FROM public.profiles
  WHERE id = v_user_id;

  UPDATE public.group_invites
  SET status = 'accepted'
  WHERE id = v_invite.id;

  UPDATE public.group_members
  SET user_id = v_user_id::text,
      supabase_user_id = v_user_id,
      invite_status = 'accepted',
      display_name = COALESCE(v_profile_name, display_name, v_user_email),
      avatar_url = COALESCE(v_profile_avatar, avatar_url),
      joined_at = COALESCE(joined_at, timezone('utc'::text, now()))
  WHERE group_id = v_invite.group_id
    AND lower(invite_email) = lower(v_invite.email);

  IF NOT FOUND THEN
    INSERT INTO public.group_members (
      group_id,
      user_id,
      supabase_user_id,
      display_name,
      avatar_url,
      role,
      invite_status,
      invite_email,
      joined_at
    ) VALUES (
      v_invite.group_id,
      v_user_id::text,
      v_user_id,
      COALESCE(v_profile_name, v_user_email),
      v_profile_avatar,
      'member',
      'accepted',
      v_invite.email,
      timezone('utc'::text, now())
    )
    ON CONFLICT (group_id, user_id) DO UPDATE
    SET supabase_user_id = EXCLUDED.supabase_user_id,
        display_name = EXCLUDED.display_name,
        avatar_url = EXCLUDED.avatar_url,
        invite_status = 'accepted',
        invite_email = EXCLUDED.invite_email;
  END IF;

  RETURN v_invite.group_id;
END;
$$;

REVOKE ALL ON FUNCTION public.accept_group_invite(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_group_invite(text) TO authenticated;
