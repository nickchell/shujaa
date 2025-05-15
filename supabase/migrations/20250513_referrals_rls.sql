-- Enable RLS on referrals table
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own referrals" ON referrals;
DROP POLICY IF EXISTS "Users can create referrals" ON referrals;
DROP POLICY IF EXISTS "Users can update their own referrals" ON referrals;
DROP POLICY IF EXISTS "Users can delete their own referrals" ON referrals;

-- Policy for viewing referrals
-- Users can view referrals where they are either the referrer or the referred
CREATE POLICY "Users can view their own referrals" ON referrals
  FOR SELECT USING (
    (auth.uid())::text = referrer_id::text OR 
    (auth.uid())::text = referred_id::text
  );

-- Policy for creating referrals
-- Users can create referrals where they are either the referrer or the referred
CREATE POLICY "Users can create referrals" ON referrals
  FOR INSERT WITH CHECK (
    referred_id IS NOT NULL AND
    referrer_id != referred_id -- Prevent self-referrals
  );

-- Policy for updating referrals
-- Users can only update referral status if they are the referrer
CREATE POLICY "Users can update their own referrals" ON referrals
  FOR UPDATE USING (
    (auth.uid())::text = referrer_id::text
  ) WITH CHECK (
    (auth.uid())::text = referrer_id::text AND
    -- Only allow updating the status field
    status IN ('pending', 'completed', 'cancelled')
  );

-- Policy for deleting referrals
-- Users can only delete referrals if they are the referrer and the status is 'pending'
CREATE POLICY "Users can delete their own referrals" ON referrals
  FOR DELETE USING (
    (auth.uid())::text = referrer_id::text AND
    status = 'pending'
  );

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON referrals TO authenticated;
