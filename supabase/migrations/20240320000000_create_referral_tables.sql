-- Add referral columns to users table
ALTER TABLE users
ADD COLUMN referral_code TEXT UNIQUE,
ADD COLUMN referred_by TEXT REFERENCES users(referral_code);

-- Create referrals table
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES users(id),
  referred_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reward_granted BOOLEAN DEFAULT FALSE,
  reward_type TEXT,
  reward_amount INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster lookups
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX idx_users_referral_code ON users(referral_code);

-- Create function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate a random 6-character alphanumeric code
  NEW.referral_code := upper(substring(md5(random()::text) from 1 for 6));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate referral code
CREATE TRIGGER set_referral_code
  BEFORE INSERT ON users
  FOR EACH ROW
  WHEN (NEW.referral_code IS NULL)
  EXECUTE FUNCTION generate_referral_code(); 