-- Fix RLS Policies for public.group_members to allow group creators, self-joiners, and accepted members to perform CRUD operations

DROP POLICY IF EXISTS "group_members_select_v4" ON public.group_members;
CREATE POLICY "group_members_select_v4" ON public.group_members
  FOR SELECT TO authenticated
  USING (
    is_group_creator(group_id)
    OR (user_id = (SELECT auth.uid())::text)
    OR (supabase_user_id = (SELECT auth.uid()))
    OR is_member_of_group_text(group_id)
  );

DROP POLICY IF EXISTS "group_members_insert_v4" ON public.group_members;
CREATE POLICY "group_members_insert_v4" ON public.group_members
  FOR INSERT TO authenticated
  WITH CHECK (
    is_group_creator(group_id)
    OR (user_id = (SELECT auth.uid())::text)
    OR (supabase_user_id = (SELECT auth.uid()))
    OR is_member_of_group_text(group_id)
  );

DROP POLICY IF EXISTS "group_members_update_v4" ON public.group_members;
CREATE POLICY "group_members_update_v4" ON public.group_members
  FOR UPDATE TO authenticated
  USING (
    is_group_creator(group_id)
    OR (user_id = (SELECT auth.uid())::text)
    OR (supabase_user_id = (SELECT auth.uid()))
    OR is_member_of_group_text(group_id)
  )
  WITH CHECK (
    is_group_creator(group_id)
    OR (user_id = (SELECT auth.uid())::text)
    OR (supabase_user_id = (SELECT auth.uid()))
    OR is_member_of_group_text(group_id)
  );

DROP POLICY IF EXISTS "group_members_delete_v4" ON public.group_members;
CREATE POLICY "group_members_delete_v4" ON public.group_members
  FOR DELETE TO authenticated
  USING (
    is_group_creator(group_id)
    OR (user_id = (SELECT auth.uid())::text)
    OR (supabase_user_id = (SELECT auth.uid()))
    OR is_member_of_group_text(group_id)
  );
