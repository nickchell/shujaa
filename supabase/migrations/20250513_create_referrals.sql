-- Create referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id text NOT NULL,
  referred_id text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  reward_granted boolean DEFAULT false,
  reward_type text,
  reward_amount numeric,
  created_at timestamptz DEFAULT now() NOT NULL,
  completed_at timestamptz,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (referred_id),
  CONSTRAINT referrals_referrer_id_fkey FOREIGN KEY (referrer_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT referrals_referred_id_fkey FOREIGN KEY (referred_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT referrer_not_self CHECK (referrer_id != referred_id)
);

-- Add RLS policies
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own referrals (as referrer)
CREATE POLICY "Users can read their own referrals"
  ON public.referrals
  FOR SELECT
  USING (auth.uid()::text = referrer_id);

-- Allow service role to manage all referrals
CREATE POLICY "Service role can manage all referrals"
  ON public.referrals
  USING (auth.jwt()->>'role' = 'service_role');

-- Create trigger to update updated_at timestamp
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime('updated_at');

-- Create indexes for faster lookups
CREATE INDEX referrals_referrer_id_idx ON public.referrals (referrer_id);
CREATE INDEX referrals_referred_id_idx ON public.referrals (referred_id);
CREATE INDEX referrals_status_idx ON public.referrals (status);

-- Grant permissions
GRANT SELECT ON public.referrals TO authenticated;
GRANT SELECT ON public.referrals TO service_role;
