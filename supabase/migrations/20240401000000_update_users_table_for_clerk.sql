-- Begin transaction to ensure all changes are applied together
BEGIN;

-- First disable RLS to avoid policy conflicts
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE referrals DISABLE ROW LEVEL SECURITY;
ALTER TABLE referral_stats DISABLE ROW LEVEL SECURITY;

-- Drop existing policies that reference the ID columns
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can read their own referrals" ON referrals;
DROP POLICY IF EXISTS "Users can insert their own referrals" ON referrals;
DROP POLICY IF EXISTS "Users can read their own referral stats" ON referral_stats;
DROP POLICY IF EXISTS "Users can update their own referral stats" ON referral_stats;

-- Drop any foreign key constraints that would prevent the type change
ALTER TABLE referrals DROP CONSTRAINT IF EXISTS referrals_referrer_id_fkey;
ALTER TABLE referrals DROP CONSTRAINT IF EXISTS referrals_referred_id_fkey;
ALTER TABLE referral_stats DROP CONSTRAINT IF EXISTS referral_stats_user_id_fkey;

-- Update users table to use TEXT IDs instead of UUIDs to work with Clerk
ALTER TABLE users
ALTER COLUMN id TYPE TEXT;

-- Update referrals table to match
ALTER TABLE referrals
ALTER COLUMN referrer_id TYPE TEXT,
ALTER COLUMN referred_id TYPE TEXT;

-- Update referral_stats table to match
ALTER TABLE referral_stats
ALTER COLUMN user_id TYPE TEXT;

-- Recreate the foreign key constraints with the new data types
ALTER TABLE referrals 
ADD CONSTRAINT referrals_referrer_id_fkey 
FOREIGN KEY (referrer_id) REFERENCES users(id);

ALTER TABLE referrals 
ADD CONSTRAINT referrals_referred_id_fkey 
FOREIGN KEY (referred_id) REFERENCES users(id);

ALTER TABLE referral_stats 
ADD CONSTRAINT referral_stats_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id);

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_stats ENABLE ROW LEVEL SECURITY;

-- Recreate policies using TEXT id comparisons
-- Allow users to read their own data
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT
  USING (id = auth.uid());

-- Allow users to update their own data
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE
  USING (id = auth.uid());

-- Allow users to read their own referrals
CREATE POLICY "Users can read their own referrals" ON referrals
  FOR SELECT
  USING (referrer_id = auth.uid() OR referred_id = auth.uid());

-- Allow users to insert their own referrals
CREATE POLICY "Users can insert their own referrals" ON referrals
  FOR INSERT
  WITH CHECK (referrer_id = auth.uid());

-- Allow users to read their own referral stats
CREATE POLICY "Users can read their own referral stats" ON referral_stats
  FOR SELECT
  USING (user_id = auth.uid());

-- Allow users to update their own referral stats
CREATE POLICY "Users can update their own referral stats" ON referral_stats
  FOR UPDATE
  USING (user_id = auth.uid());

-- Add comments to explain the change
COMMENT ON TABLE users IS 'User profiles with Clerk integration, using TEXT ids instead of UUIDs';
COMMENT ON COLUMN users.id IS 'Clerk user ID, in text format like user_xxx';

-- Commit the transaction if everything succeeded
COMMIT; 