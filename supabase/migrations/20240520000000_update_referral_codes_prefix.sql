-- Migration to update all referral_codes to use 'rafiki-' prefix
-- First, let's create a safety snapshot of the current state
CREATE TABLE IF NOT EXISTS referral_code_backups (
  user_id TEXT PRIMARY KEY,
  old_code TEXT,
  new_code TEXT,
  migrated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the function to migrate codes
CREATE OR REPLACE FUNCTION migrate_referral_codes() RETURNS void AS $$
DECLARE
  user_rec RECORD;
  new_code TEXT;
BEGIN
  -- Process one user at a time to avoid conflicts
  FOR user_rec IN 
    SELECT id, referral_code 
    FROM users 
    WHERE referral_code IS NOT NULL 
    AND referral_code NOT LIKE 'rafiki-%'
  LOOP
    -- Generate a new unique code with rafiki- prefix
    new_code := 'rafiki-' || substring(md5(random()::text), 1, 8);
    
    -- Save a backup
    INSERT INTO referral_code_backups (user_id, old_code, new_code)
    VALUES (user_rec.id, user_rec.referral_code, new_code);
    
    -- Update the user's referral code
    UPDATE users SET referral_code = new_code WHERE id = user_rec.id;
    
    -- Update all references to this code in referred_by
    UPDATE users SET referred_by = new_code WHERE referred_by = user_rec.referral_code;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the migration function
SELECT migrate_referral_codes();

-- Drop the function when done (clean up)
DROP FUNCTION migrate_referral_codes();

-- Keep the backup table for reference
COMMENT ON TABLE referral_code_backups IS 'Backup of referral codes migrated from non-rafiki prefix to rafiki- prefix'; 