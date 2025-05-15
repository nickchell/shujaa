-- Drop existing foreign key constraint if it exists
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_new_referred_by_fkey;

-- Add the correct foreign key constraint
ALTER TABLE users 
  DROP COLUMN IF EXISTS referred_by,
  ADD COLUMN referred_by TEXT REFERENCES users(referral_code);

-- Update referrals table constraints and defaults
ALTER TABLE referrals
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  DROP CONSTRAINT IF EXISTS referrals_referrer_id_fkey,
  DROP CONSTRAINT IF EXISTS referrals_referred_id_fkey,
  ADD CONSTRAINT referrals_referrer_id_fkey FOREIGN KEY (referrer_id) REFERENCES users(id),
  ADD CONSTRAINT referrals_referred_id_fkey FOREIGN KEY (referred_id) REFERENCES users(id),
  ALTER COLUMN referrer_id SET NOT NULL,
  ALTER COLUMN referred_id SET NOT NULL;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can create referrals" ON referrals;
CREATE POLICY "Users can create referrals" ON referrals
  FOR INSERT WITH CHECK (
    referred_id IS NOT NULL AND
    referrer_id != referred_id -- Prevent self-referrals
  );
