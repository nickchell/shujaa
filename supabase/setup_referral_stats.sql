-- Create referral_stats table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.referral_stats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL UNIQUE,
  total_referrals integer DEFAULT 0 NOT NULL,
  successful_referrals integer DEFAULT 0 NOT NULL,
  total_rewards numeric DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.referral_stats ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can read their own referral stats" ON public.referral_stats;
CREATE POLICY "Users can read their own referral stats"
  ON public.referral_stats
  FOR SELECT
  USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Service role can manage all referral stats" ON public.referral_stats;
CREATE POLICY "Service role can manage all referral stats"
  ON public.referral_stats
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Create indexes
CREATE INDEX IF NOT EXISTS referral_stats_user_id_idx ON public.referral_stats (user_id);

-- Grant permissions
GRANT SELECT ON public.referral_stats TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.referral_stats TO service_role;
