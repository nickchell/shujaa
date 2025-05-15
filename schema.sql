-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE,
  referral_code TEXT UNIQUE,
  referred_by TEXT REFERENCES users(referral_code),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create referral_stats table
CREATE TABLE IF NOT EXISTS referral_stats (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  total_referrals INTEGER DEFAULT 0,
  completed_referrals INTEGER DEFAULT 0,
  pending_referrals INTEGER DEFAULT 0,
  total_rewards INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id TEXT REFERENCES users(id),
  referred_id TEXT REFERENCES users(id),
  status TEXT CHECK (status IN ('pending', 'completed', 'invalid')) DEFAULT 'pending',
  reward_granted BOOLEAN DEFAULT FALSE,
  reward_type TEXT,
  reward_amount INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    -- Explicitly ensure 'rafiki-' prefix is used
    NEW.referral_code := 'rafiki-' || substring(md5(random()::text), 1, 8);
  ELSE
    -- Check if code doesn't have 'rafiki-' prefix and fix it if needed
    IF NEW.referral_code NOT LIKE 'rafiki-%' THEN
      -- If it has a different prefix like 'shuj-', replace it
      IF NEW.referral_code LIKE '%-' || substring(NEW.referral_code FROM position('-' in NEW.referral_code) + 1) THEN
        NEW.referral_code := 'rafiki-' || substring(NEW.referral_code FROM position('-' in NEW.referral_code) + 1);
      ELSE
        -- If no prefix, add one
        NEW.referral_code := 'rafiki-' || NEW.referral_code;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for referral code generation
DROP TRIGGER IF EXISTS set_referral_code ON users;
CREATE TRIGGER set_referral_code
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION generate_referral_code();

-- Create function to initialize referral stats
CREATE OR REPLACE FUNCTION initialize_referral_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO referral_stats (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for referral stats initialization
DROP TRIGGER IF EXISTS init_referral_stats ON users;
CREATE TRIGGER init_referral_stats
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_referral_stats(); 