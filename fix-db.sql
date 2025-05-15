-- SQL file to fix the database structure for Clerk IDs
-- This can be run directly via psql or pgAdmin

-- Disable triggers temporarily
SET session_replication_role = 'replica';

-- Drop policies that reference the columns
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can read their own referrals" ON referrals;
DROP POLICY IF EXISTS "Users can insert their own referrals" ON referrals;
DROP POLICY IF EXISTS "Users can read their own referral stats" ON referral_stats;
DROP POLICY IF EXISTS "Users can update their own referral stats" ON referral_stats;

-- Drop constraints to allow type changes
ALTER TABLE referrals DROP CONSTRAINT IF EXISTS referrals_referrer_id_fkey;
ALTER TABLE referrals DROP CONSTRAINT IF EXISTS referrals_referred_id_fkey;
ALTER TABLE referral_stats DROP CONSTRAINT IF EXISTS referral_stats_user_id_fkey;

-- Convert UUID columns to TEXT to work with Clerk
ALTER TABLE users ALTER COLUMN id TYPE TEXT;
ALTER TABLE referrals ALTER COLUMN referrer_id TYPE TEXT;
ALTER TABLE referrals ALTER COLUMN referred_id TYPE TEXT;
ALTER TABLE referral_stats ALTER COLUMN user_id TYPE TEXT;

-- Recreate foreign key constraints
ALTER TABLE referrals ADD CONSTRAINT referrals_referrer_id_fkey FOREIGN KEY (referrer_id) REFERENCES users(id);
ALTER TABLE referrals ADD CONSTRAINT referrals_referred_id_fkey FOREIGN KEY (referred_id) REFERENCES users(id);
ALTER TABLE referral_stats ADD CONSTRAINT referral_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);

-- Recreate policies
CREATE POLICY "Users can read their own data" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can read their own referrals" ON referrals FOR SELECT USING (referrer_id = auth.uid() OR referred_id = auth.uid());
CREATE POLICY "Users can insert their own referrals" ON referrals FOR INSERT WITH CHECK (referrer_id = auth.uid());
CREATE POLICY "Users can read their own referral stats" ON referral_stats FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own referral stats" ON referral_stats FOR UPDATE USING (user_id = auth.uid());

-- Re-enable triggers
SET session_replication_role = 'origin'; 