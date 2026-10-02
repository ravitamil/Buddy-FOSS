CREATE TABLE IF NOT EXISTS public.feature_controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  environment text NOT NULL DEFAULT 'production',
  platform text NOT NULL DEFAULT 'all' CHECK (platform IN ('all', 'android', 'ios')),
  feature_key text NOT NULL,
  status text NOT NULL CHECK (status IN ('enabled', 'hidden', 'read_only', 'maintenance', 'disabled')),
  message text,
  action_overrides jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (environment, platform, feature_key)
);

ALTER TABLE public.feature_controls ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.feature_controls TO anon;
GRANT SELECT ON public.feature_controls TO authenticated;
GRANT ALL ON public.feature_controls TO service_role;

DROP POLICY IF EXISTS "feature_controls_public_select" ON public.feature_controls;
CREATE POLICY "feature_controls_public_select" ON public.feature_controls
  FOR SELECT TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS feature_controls_lookup_idx
  ON public.feature_controls (environment, platform, feature_key);
