-- Migration: Fix budgets table RLS
-- Description: Restrict budgets to authenticated users and ensure per-user isolation

-- 1. Enable RLS (already enabled in schema, but good to be explicit)
ALTER TABLE "public"."budgets" ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing broad policy
DROP POLICY IF EXISTS "Users can manage own budgets" ON public.budgets;

-- 3. Create granular policies restricted to authenticated users

-- SELECT: Users can only see their own budgets
CREATE POLICY "budgets_select_authenticated" ON "public"."budgets"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: Users can only insert budgets for themselves
CREATE POLICY "budgets_insert_authenticated" ON "public"."budgets"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own budgets
CREATE POLICY "budgets_update_authenticated" ON "public"."budgets"
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own budgets
CREATE POLICY "budgets_delete_authenticated" ON "public"."budgets"
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. Audit grants
-- Ensure authenticated role has necessary permissions (RLS will then filter)
GRANT ALL ON TABLE "public"."budgets" TO authenticated;
