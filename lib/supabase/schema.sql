-- Add referral_code to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by TEXT REFERENCES users(referral_code);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID REFERENCES users(id) NOT NULL,
    referred_id UUID REFERENCES users(id) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'invalid')),
    reward_granted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(referred_id)
);

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
    -- Log the trigger execution
    RAISE NOTICE 'Generating referral code for user %', NEW.id;
    
    -- Generate a unique code using the first 4 chars of UUID and a random number
    new_code := 'shuj-' || substr(NEW.id::text, 1, 4) || floor(random() * 10000)::text;
    
    -- Log the generated code
    RAISE NOTICE 'Generated referral code: %', new_code;
    
    -- Set the referral code
    NEW.referral_code := new_code;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log any errors
        RAISE NOTICE 'Error generating referral code: %', SQLERRM;
        -- Generate a fallback code
        NEW.referral_code := 'shuj-' || substr(NEW.id::text, 1, 4) || floor(random() * 10000)::text;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_referral_code ON users;

-- Create trigger to automatically generate referral code
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