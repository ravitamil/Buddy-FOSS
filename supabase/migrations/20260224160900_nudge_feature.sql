-- Add expo_push_token to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS expo_push_token TEXT;

-- Create nudge_log table
CREATE TABLE IF NOT EXISTS nudge_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nudger_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  debtor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  nudged_at TIMESTAMPTZ DEFAULT now()
);

-- Index for rate-limiting queries
CREATE INDEX IF NOT EXISTS idx_nudge_log_rate_limit ON nudge_log(nudger_id, debtor_id, group_id, nudged_at);

-- RLS
ALTER TABLE nudge_log ENABLE ROW LEVEL SECURITY;

-- Nudger can insert their own logs
CREATE POLICY "Users can insert their own nudge logs" ON nudge_log
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = nudger_id);

-- Nudger can read their own logs (for checking rate limits)
CREATE POLICY "Users can read their own nudge logs" ON nudge_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = nudger_id);
