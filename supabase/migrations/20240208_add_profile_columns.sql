ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS date_of_birth timestamp with time zone,
ADD COLUMN IF NOT EXISTS currency text,
ADD COLUMN IF NOT EXISTS language text,
ADD COLUMN IF NOT EXISTS theme text,
ADD COLUMN IF NOT EXISTS notification_settings jsonb,
ADD COLUMN IF NOT EXISTS is_onboarding_complete boolean DEFAULT false;
