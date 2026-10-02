-- Fix transactions.paid_by foreign key to allow user deletion
-- Currently, paid_by defaults to NO ACTION / RESTRICT, which blocks user deletion if they paid for a transaction.
-- We change it to SET NULL so the transaction record remains but the link to the deleted user is removed.

DO $$
BEGIN
  -- specific constraint name might vary, so we drop by name if we know it, or we can use a more robust approach.
  -- assuming standard naming convention or from schema.sql interception.
  -- In schema.sql: paid_by uuid REFERENCES auth.users(id),
  -- Postgres usually names this transactions_paid_by_fkey
  
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'transactions_paid_by_fkey') THEN
    ALTER TABLE public.transactions DROP CONSTRAINT transactions_paid_by_fkey;
  END IF;

  ALTER TABLE public.transactions 
    ADD CONSTRAINT transactions_paid_by_fkey 
    FOREIGN KEY (paid_by) 
    REFERENCES auth.users(id) 
    ON DELETE SET NULL;

END $$;
