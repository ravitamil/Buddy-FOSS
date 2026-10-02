-- Add cin_id to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cin_id text UNIQUE;

-- Function to generate a 6-character alphanumeric string
-- Using safe characters: A-Z, 2-9 (excluding 0, 1, O, I for clarity)
CREATE OR REPLACE FUNCTION public.generate_cin_id()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result text := '';
    i integer := 0;
    is_unique boolean := false;
BEGIN
    WHILE NOT is_unique LOOP
        result := '';
        FOR i IN 1..6 LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
        END LOOP;
        
        -- Check if it already exists
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE cin_id = result) THEN
            is_unique := true;
        END IF;
    END LOOP;
    
    RETURN result;
END;
$$;

-- Trigger to automatically assign cin_id on insert
CREATE OR REPLACE FUNCTION public.set_cin_id()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.cin_id IS NULL THEN
        NEW.cin_id := public.generate_cin_id();
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ensure_cin_id ON public.profiles;
CREATE TRIGGER ensure_cin_id
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_cin_id();

-- Backfill existing profiles
DO $$
DECLARE
    profile_record record;
BEGIN
    FOR profile_record IN SELECT id FROM public.profiles WHERE cin_id IS NULL LOOP
        UPDATE public.profiles
        SET cin_id = public.generate_cin_id()
        WHERE id = profile_record.id;
    END LOOP;
END;
$$;
