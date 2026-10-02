-- Migration: 20260902000008_fix_investments_category_foreign_key.sql
-- Description: Add foreign key constraint between investments(category_id) and categories(id) to allow PostgREST resource embedding

-- 1. Ensure any orphan category_ids in investments are cleaned up
UPDATE public.investments
SET category_id = NULL
WHERE category_id IS NOT NULL
  AND category_id NOT IN (SELECT id FROM public.categories);

-- 2. Add foreign key constraint
ALTER TABLE public.investments
  DROP CONSTRAINT IF EXISTS investments_category_id_fkey;

ALTER TABLE public.investments
  ADD CONSTRAINT investments_category_id_fkey
  FOREIGN KEY (category_id)
  REFERENCES public.categories(id)
  ON DELETE SET NULL;

-- 3. Add index for query performance
CREATE INDEX IF NOT EXISTS idx_investments_category_id ON public.investments(category_id);

-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
