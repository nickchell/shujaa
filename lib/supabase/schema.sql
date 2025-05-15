-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    avatar_url TEXT,
    referral_code TEXT UNIQUE,
    referred_by TEXT REFERENCES users(referral_code),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add referral_code and referred_by to users if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by TEXT REFERENCES users(referral_code);

-- Create referrals table if it doesn't exist
CREATE TABLE IF NOT EXISTS referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID REFERENCES users(id) NOT NULL,
    referred_id UUID REFERENCES users(id) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'invalid')),
    reward_granted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(referred_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);

-- Create referral_stats table
CREATE TABLE IF NOT EXISTS referral_stats (
    user_id UUID REFERENCES users(id) PRIMARY KEY,
    total_referrals INTEGER DEFAULT 0,
    completed_referrals INTEGER DEFAULT 0,
    pending_referrals INTEGER DEFAULT 0,
    total_rewards INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
DECLARE
    new_code TEXT;
BEGIN
    -- Generate a unique code using the prefix 'rafiki-' and a random string
    new_code := 'rafiki-' || substring(md5(random()::text), 1, 8);
    
    -- Set the referral code
    NEW.referral_code := upper(new_code);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate referral code if one isn't provided
DROP TRIGGER IF EXISTS set_referral_code ON users;
CREATE TRIGGER set_referral_code
  BEFORE INSERT ON users
  FOR EACH ROW
  WHEN (NEW.referral_code IS NULL)
  EXECUTE FUNCTION generate_referral_code();

-- Create function to initialize referral stats
CREATE OR REPLACE FUNCTION initialize_referral_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO referral_stats (user_id, total_referrals, completed_referrals, pending_referrals, total_rewards)
    VALUES (NEW.id, 0, 0, 0, 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to initialize referral stats when user is created
CREATE TRIGGER initialize_referral_stats
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION initialize_referral_stats();

-- Create function to update referral stats
CREATE OR REPLACE FUNCTION update_referral_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update stats for referrer
    UPDATE referral_stats
    SET 
        total_referrals = (
            SELECT COUNT(*) FROM referrals 
            WHERE referrer_id = NEW.referrer_id
        ),
        completed_referrals = (
            SELECT COUNT(*) FROM referrals 
            WHERE referrer_id = NEW.referrer_id AND status = 'completed'
        ),
        pending_referrals = (
            SELECT COUNT(*) FROM referrals 
            WHERE referrer_id = NEW.referrer_id AND status = 'pending'
        ),
        total_rewards = (
            SELECT COUNT(*) FROM referrals 
            WHERE referrer_id = NEW.referrer_id AND reward_granted = true
        ),
        last_updated = NOW()
    WHERE user_id = NEW.referrer_id;

    -- If no stats exist, create them
    IF NOT FOUND THEN
        INSERT INTO referral_stats (user_id, total_referrals, completed_referrals, pending_referrals, total_rewards)
        VALUES (
            NEW.referrer_id,
            1,
            CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
            CASE WHEN NEW.status = 'pending' THEN 1 ELSE 0 END,
            CASE WHEN NEW.reward_granted THEN 1 ELSE 0 END
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update stats when referral status changes
CREATE TRIGGER update_referral_stats
    AFTER INSERT OR UPDATE ON referrals
    FOR EACH ROW
    EXECUTE FUNCTION update_referral_stats();

-- Create function to prevent updates to referred_by after user creation
CREATE OR REPLACE FUNCTION prevent_referred_by_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.referred_by IS NOT NULL AND NEW.referred_by IS DISTINCT FROM OLD.referred_by THEN
    RAISE EXCEPTION 'referred_by cannot be updated after user creation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce the rule
DROP TRIGGER IF EXISTS prevent_referred_by_update ON users;
CREATE TRIGGER prevent_referred_by_update
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION prevent_referred_by_update();

-- Enable RLS on the users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for users table
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Allow users to read their own data
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT
  USING (id::text = auth.uid()::text);

-- Allow users to update their own data
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE
  USING (id::text = auth.uid()::text);

-- Enable RLS on the referrals table
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for referrals table
DROP POLICY IF EXISTS "Users can read their own referrals" ON referrals;
DROP POLICY IF EXISTS "Users can insert their own referrals" ON referrals;

-- Allow users to read their own referrals
CREATE POLICY "Users can read their own referrals" ON referrals
  FOR SELECT
  USING (referrer_id::text = auth.uid()::text OR referred_id::text = auth.uid()::text);

-- Allow users to insert their own referrals
CREATE POLICY "Users can insert their own referrals" ON referrals
  FOR INSERT
  WITH CHECK (referrer_id::text = auth.uid()::text);

-- Enable RLS on the referral_stats table
ALTER TABLE referral_stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for referral_stats table
DROP POLICY IF EXISTS "Users can read their own referral stats" ON referral_stats;
DROP POLICY IF EXISTS "Users can update their own referral stats" ON referral_stats;

-- Allow users to read their own referral stats
CREATE POLICY "Users can read their own referral stats" ON referral_stats
  FOR SELECT
  USING (user_id = auth.uid()::text);

-- Allow users to update their own referral stats
CREATE POLICY "Users can update their own referral stats" ON referral_stats
  FOR UPDATE
  USING (user_id = auth.uid()::text); 