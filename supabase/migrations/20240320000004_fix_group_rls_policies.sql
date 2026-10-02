
-- Recreate groups policies for robustness
DROP POLICY IF EXISTS "groups_insert_authenticated" ON "public"."groups";
DROP POLICY IF EXISTS "groups_select_authenticated" ON "public"."groups";
DROP POLICY IF EXISTS "groups_update_authenticated" ON "public"."groups";
DROP POLICY IF EXISTS "groups_delete_authenticated" ON "public"."groups";

DROP POLICY IF EXISTS "group_members_insert_authenticated" ON "public"."group_members";
DROP POLICY IF EXISTS "group_members_select_authenticated" ON "public"."group_members";
DROP POLICY IF EXISTS "group_members_update_authenticated" ON "public"."group_members";
DROP POLICY IF EXISTS "group_members_delete_authenticated" ON "public"."group_members";

-- Recreate groups policies
CREATE POLICY "groups_select_authenticated" ON "public"."groups"
FOR SELECT TO authenticated
USING (
  created_by = auth.uid() OR
  is_member_of_group(id)
);

CREATE POLICY "groups_insert_authenticated" ON "public"."groups"
FOR INSERT TO authenticated
WITH CHECK (
  created_by = auth.uid()
);

CREATE POLICY "groups_update_authenticated" ON "public"."groups"
FOR UPDATE TO authenticated
USING (
  created_by = auth.uid() OR
  is_member_of_group(id)
);

CREATE POLICY "groups_delete_authenticated" ON "public"."groups"
FOR DELETE TO authenticated
USING (
  created_by = auth.uid()
);

-- Recreate group_members policies
CREATE POLICY "group_members_select_authenticated" ON "public"."group_members"
FOR SELECT TO authenticated
USING (
  user_id = auth.uid() OR
  is_member_of_group(group_id)
);

CREATE POLICY "group_members_insert_authenticated" ON "public"."group_members"
FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_id
    AND groups.created_by = auth.uid()
  )
);

CREATE POLICY "group_members_update_authenticated" ON "public"."group_members"
FOR UPDATE TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_id
    AND groups.created_by = auth.uid()
  )
);

CREATE POLICY "group_members_delete_authenticated" ON "public"."group_members"
FOR DELETE TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_id
    AND groups.created_by = auth.uid()
  )
);
