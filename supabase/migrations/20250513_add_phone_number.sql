-- Add phone_number column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);

-- Add phone_number to RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can update their own phone_number"
ON users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view phone numbers of their referrals"
ON users
FOR SELECT
USING (
  auth.uid() = id OR
  EXISTS (
    SELECT 1 FROM referrals
    WHERE (referrals.referrer_id = auth.uid() AND referrals.referred_id = users.id)
  )
);
