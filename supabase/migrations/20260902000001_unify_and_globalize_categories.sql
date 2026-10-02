-- Migration: 20260902000001_unify_and_globalize_categories.sql
-- Description: Unify categories and investment_categories into a single table with global system categories

-- 1. Make user_id nullable in public.categories
ALTER TABLE public.categories ALTER COLUMN user_id DROP NOT NULL;

-- 2. Add investment-specific columns to public.categories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS risk_level text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS expected_return numeric;

-- 3. Update CHECK constraints
ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_type_check;
ALTER TABLE public.categories ADD CONSTRAINT categories_type_check CHECK (type IN ('income', 'expense', 'investment'));

ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_risk_level_check;
ALTER TABLE public.categories ADD CONSTRAINT categories_risk_level_check CHECK (risk_level IS NULL OR risk_level IN ('low', 'medium', 'high'));

-- 4. Seed Deterministic Global System Categories (Income & Expense)
INSERT INTO public.categories (id, user_id, name, icon, color, type, is_default) VALUES
  ('00000000-0000-0000-0000-000000000101', NULL, 'Salary', 'cash', '#4CAF50', 'income', true),
  ('00000000-0000-0000-0000-000000000102', NULL, 'Freelance', 'briefcase', '#2196F3', 'income', true),
  ('00000000-0000-0000-0000-000000000103', NULL, 'Investments', 'trending-up', '#9C27B0', 'income', true),
  ('00000000-0000-0000-0000-000000000104', NULL, 'Gift', 'gift', '#E91E63', 'income', true),
  ('00000000-0000-0000-0000-000000000105', NULL, 'Other', 'ellipsis-horizontal', '#607D8B', 'income', true),
  ('00000000-0000-0000-0000-000000000201', NULL, 'Food', 'restaurant', '#FF5722', 'expense', true),
  ('00000000-0000-0000-0000-000000000202', NULL, 'Transport', 'car', '#FF9800', 'expense', true),
  ('00000000-0000-0000-0000-000000000203', NULL, 'Housing', 'home', '#795548', 'expense', true),
  ('00000000-0000-0000-0000-000000000204', NULL, 'Utilities', 'flash', '#FFC107', 'expense', true),
  ('00000000-0000-0000-0000-000000000205', NULL, 'Entertainment', 'film', '#673AB7', 'expense', true),
  ('00000000-0000-0000-0000-000000000206', NULL, 'Health', 'medkit', '#F44336', 'expense', true),
  ('00000000-0000-0000-0000-000000000207', NULL, 'Shopping', 'cart', '#E91E63', 'expense', true),
  ('00000000-0000-0000-0000-000000000208', NULL, 'Education', 'school', '#3F51B5', 'expense', true),
  ('00000000-0000-0000-0000-000000000209', NULL, 'Personal Care', 'person', '#009688', 'expense', true),
  ('00000000-0000-0000-0000-000000000210', NULL, 'Travel', 'airplane', '#03A9F4', 'expense', true),
  ('00000000-0000-0000-0000-000000000211', NULL, 'Debt', 'card', '#F44336', 'expense', true),
  ('00000000-0000-0000-0000-000000000212', NULL, 'Savings', 'wallet', '#4CAF50', 'expense', true),
  ('00000000-0000-0000-0000-000000000213', NULL, 'Other', 'ellipsis-horizontal', '#9E9E9E', 'expense', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  type = EXCLUDED.type,
  user_id = NULL,
  is_default = true;

-- 5. Seed Deterministic Global System Categories (Investment)
INSERT INTO public.categories (id, user_id, name, icon, color, type, risk_level, expected_return, is_default) VALUES
  ('00000000-0000-0000-0000-000000000301', NULL, 'Stocks', 'trending-up', '#4CAF50', 'investment', 'high', 10, true),
  ('00000000-0000-0000-0000-000000000302', NULL, 'Crypto', 'logo-bitcoin', '#F44336', 'investment', 'high', 15, true),
  ('00000000-0000-0000-0000-000000000303', NULL, 'Mutual Funds', 'pie-chart', '#2196F3', 'investment', 'medium', 8, true),
  ('00000000-0000-0000-0000-000000000304', NULL, 'ETFs', 'layers', '#9C27B0', 'investment', 'medium', 8, true),
  ('00000000-0000-0000-0000-000000000305', NULL, 'Bonds', 'document-text', '#FF9800', 'investment', 'low', 5, true),
  ('00000000-0000-0000-0000-000000000306', NULL, 'Real Estate', 'home', '#795548', 'investment', 'medium', 7, true),
  ('00000000-0000-0000-0000-000000000307', NULL, 'Other', 'apps', '#607D8B', 'investment', 'medium', 5, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  type = EXCLUDED.type,
  risk_level = EXCLUDED.risk_level,
  expected_return = EXCLUDED.expected_return,
  user_id = NULL,
  is_default = true;

-- 6. Remap existing transactions/group_transactions pointing to old duplicate categories to the new global deterministic IDs
UPDATE public.transactions t
SET category_id = g.id
FROM public.categories old_c
JOIN public.categories g ON g.user_id IS NULL AND g.name = old_c.name AND g.type = old_c.type
WHERE t.category_id = old_c.id AND old_c.user_id IS NOT NULL AND old_c.is_default = true;

DO $$
BEGIN
  IF to_regclass('public.group_transactions') IS NOT NULL THEN
    UPDATE public.group_transactions gt
    SET category_id = g.id
    FROM public.categories old_c
    JOIN public.categories g
      ON g.user_id IS NULL AND g.name = old_c.name AND g.type = old_c.type
    WHERE gt.category_id = old_c.id
      AND old_c.user_id IS NOT NULL
      AND old_c.is_default = true;
  END IF;
END $$;

-- 7. Delete redundant user-specific duplicate default categories
DELETE FROM public.categories WHERE user_id IS NOT NULL AND is_default = true;

-- 8. Drop investment_categories table if exists (unified into categories)
DROP TABLE IF EXISTS public.investment_categories CASCADE;

-- 9. Update Row Level Security Policies on public.categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_all_authenticated" ON public.categories;
DROP POLICY IF EXISTS "categories_select_authenticated" ON public.categories;
DROP POLICY IF EXISTS "categories_insert_authenticated" ON public.categories;
DROP POLICY IF EXISTS "categories_update_authenticated" ON public.categories;
DROP POLICY IF EXISTS "categories_delete_authenticated" ON public.categories;

CREATE POLICY "categories_select_authenticated" ON public.categories
  FOR SELECT TO authenticated
  USING (user_id IS NULL OR user_id = (SELECT auth.uid()));

CREATE POLICY "categories_insert_authenticated" ON public.categories
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()) AND is_default = false);

CREATE POLICY "categories_update_authenticated" ON public.categories
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()) AND is_default = false);

CREATE POLICY "categories_delete_authenticated" ON public.categories
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()) AND is_default = false);

REVOKE ALL ON TABLE public.categories FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.categories TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_user_type ON public.categories(user_id, type);
CREATE INDEX IF NOT EXISTS idx_categories_is_default ON public.categories(is_default);
