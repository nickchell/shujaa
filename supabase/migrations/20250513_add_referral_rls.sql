-- Drop any existing policies
DROP POLICY IF EXISTS "Users can view their own referrals" ON referrals;
DROP POLICY IF EXISTS "Users can create referrals" ON referrals;
DROP POLICY IF EXISTS "Users can update their own referrals" ON referrals;

-- Enable RLS on referrals table
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Policy for viewing referrals
CREATE POLICY "Users can view their own referrals"
ON referrals
FOR SELECT
USING (
  auth.uid() = referrer_id OR 
  auth.uid() = referred_id
);

-- Policy for creating referrals
CREATE POLICY "Users can create referrals"
ON referrals
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
);

-- Policy for updating referrals
CREATE POLICY "Users can update their own referrals"
ON referrals
FOR UPDATE
USING (
  auth.uid() = referred_id OR 
  auth.uid() = referrer_id
);
