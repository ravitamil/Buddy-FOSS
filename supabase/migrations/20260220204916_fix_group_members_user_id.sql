-- Drop existing foreign key constraint from group_members to auth.users
ALTER TABLE public.group_members DROP CONSTRAINT IF EXISTS group_members_user_id_fkey;

-- Change user_id type from uuid to text to support client-generated IDs for non-auth members
ALTER TABLE public.group_members ALTER COLUMN user_id TYPE text;

-- Update the is_member_of_group helper function to expect a text user_id matching auth.uid() 
-- We cast auth.uid() to text since user_id is now text.
CREATE OR REPLACE FUNCTION public.is_member_of_group(target_group_id uuid)
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
    AND user_id = auth.uid()::text
  );
END;
$$;
