-- This direct approach recreates the tables to fix ID column types
-- It avoids errors related to altering columns referenced in policy definitions

BEGIN;

-- Temporarily disable RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE referrals DISABLE ROW LEVEL SECURITY;
ALTER TABLE referral_stats DISABLE ROW LEVEL SECURITY;

-- Store current policies for later recreation (this is just for reference)
-- We'll manually recreate them below
CREATE TEMP TABLE saved_policies AS
SELECT
    schemaname,
    tablename,
    policyname,
    roles,
    cmd,
    qual,
    with_check
FROM
    pg_policies
WHERE
    tablename IN ('users', 'referrals', 'referral_stats');

-- Drop all policies
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT * FROM pg_policies 
        WHERE tablename IN ('users', 'referrals', 'referral_stats')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END
$$;

-- Drop all constraints
ALTER TABLE referrals DROP CONSTRAINT IF EXISTS referrals_referrer_id_fkey;
ALTER TABLE referrals DROP CONSTRAINT IF EXISTS referrals_referred_id_fkey;
ALTER TABLE referral_stats DROP CONSTRAINT IF EXISTS referral_stats_user_id_fkey;

-- Create new tables with TEXT IDs
CREATE TABLE users_new (
    id TEXT PRIMARY KEY,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    avatar_url TEXT,
    referral_code TEXT UNIQUE,
    referred_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE referrals_new (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id TEXT NOT NULL,
    referred_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'invalid')),
    reward_granted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(referred_id)
);

CREATE TABLE referral_stats_new (
    user_id TEXT PRIMARY KEY,
    total_referrals INTEGER DEFAULT 0,
    completed_referrals INTEGER DEFAULT 0,
    pending_referrals INTEGER DEFAULT 0,
    total_rewards INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Copy data (converting UUID to TEXT)
INSERT INTO users_new
SELECT 
    id::TEXT,
    email,
    first_name,
    last_name,
    full_name,
    avatar_url,
    referral_code,
    referred_by,
    created_at,
    updated_at
FROM users;

INSERT INTO referrals_new
SELECT 
    id,
    referrer_id::TEXT,
    referred_id::TEXT,
    status,
    reward_granted,
    created_at,
    updated_at
FROM referrals;

INSERT INTO referral_stats_new
SELECT 
    user_id::TEXT,
    total_referrals,
    completed_referrals,
    pending_referrals,
    total_rewards,
    last_updated
FROM referral_stats;

-- Drop old tables
DROP TABLE users CASCADE;
DROP TABLE referrals CASCADE;
DROP TABLE referral_stats CASCADE;

-- Rename new tables
ALTER TABLE users_new RENAME TO users;
ALTER TABLE referrals_new RENAME TO referrals;
ALTER TABLE referral_stats_new RENAME TO referral_stats;

-- Add foreign key constraints
ALTER TABLE referrals 
    ADD CONSTRAINT referrals_referrer_id_fkey 
    FOREIGN KEY (referrer_id) REFERENCES users(id);

ALTER TABLE referrals 
    ADD CONSTRAINT referrals_referred_id_fkey 
    FOREIGN KEY (referred_id) REFERENCES users(id);

ALTER TABLE referral_stats 
    ADD CONSTRAINT referral_stats_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id);

-- Update the referred_by foreign key
ALTER TABLE users
    ADD CONSTRAINT users_referred_by_fkey
    FOREIGN KEY (referred_by) REFERENCES users(referral_code);

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_stats ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Users can read their own data" ON users
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can read their own referrals" ON referrals
    FOR SELECT USING (referrer_id = auth.uid() OR referred_id = auth.uid());

CREATE POLICY "Users can insert their own referrals" ON referrals
    FOR INSERT WITH CHECK (referrer_id = auth.uid());

CREATE POLICY "Users can read their own referral stats" ON referral_stats
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own referral stats" ON referral_stats
    FOR UPDATE USING (user_id = auth.uid());

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);

-- Add comments
COMMENT ON TABLE users IS 'User profiles with Clerk integration, using TEXT ids instead of UUIDs';
COMMENT ON COLUMN users.id IS 'Clerk user ID, in text format like user_xxx';

COMMIT; 