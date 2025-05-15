-- Migration to fix all existing referral codes to use rafiki- prefix consistently

-- First create a function to generate proper referral codes
CREATE OR REPLACE FUNCTION generate_proper_referral_code(old_code TEXT)
RETURNS TEXT AS $$
DECLARE
  code_part TEXT;
BEGIN
  -- If null, generate completely new code
  IF old_code IS NULL THEN
    RETURN 'rafiki-' || substring(md5(random()::text), 1, 8);
  END IF;
  
  -- If already has rafiki- prefix, return as is
  IF old_code LIKE 'rafiki-%' THEN
    RETURN old_code;
  END IF;
  
  -- If has shuj- or another prefix, extract code part
  IF position('-' in old_code) > 0 THEN
    code_part := substring(old_code FROM position('-' in old_code) + 1);
    RETURN 'rafiki-' || code_part;
  END IF;
  
  -- Otherwise just add prefix
  RETURN 'rafiki-' || old_code;
END;
$$ LANGUAGE plpgsql;

-- Create a backup of current users table
CREATE TABLE IF NOT EXISTS users_backup_before_prefix_fix AS 
SELECT * FROM users;

-- Update all existing users with incorrect prefixes
UPDATE users
SET referral_code = generate_proper_referral_code(referral_code)
WHERE referral_code IS NOT NULL 
AND referral_code NOT LIKE 'rafiki-%';

-- Update all referred_by references
UPDATE users
SET referred_by = generate_proper_referral_code(referred_by)
WHERE referred_by IS NOT NULL 
AND referred_by NOT LIKE 'rafiki-%';

-- Drop the temporary function
DROP FUNCTION generate_proper_referral_code(TEXT);

-- Re-create the trigger function to ensure it fixes codes on insert/update
CREATE OR REPLACE FUNCTION normalize_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  -- For new referral codes
  IF NEW.referral_code IS NOT NULL AND NEW.referral_code NOT LIKE 'rafiki-%' THEN
    -- Extract code part if it has a prefix
    IF position('-' in NEW.referral_code) > 0 THEN
      NEW.referral_code := 'rafiki-' || substring(NEW.referral_code FROM position('-' in NEW.referral_code) + 1);
    ELSE
      -- Add prefix if no prefix exists
      NEW.referral_code := 'rafiki-' || NEW.referral_code;
    END IF;
  END IF;
  
  -- For referred_by codes
  IF NEW.referred_by IS NOT NULL AND NEW.referred_by NOT LIKE 'rafiki-%' THEN
    -- Extract code part if it has a prefix
    IF position('-' in NEW.referred_by) > 0 THEN
      NEW.referred_by := 'rafiki-' || substring(NEW.referred_by FROM position('-' in NEW.referred_by) + 1);
    ELSE
      -- Add prefix if no prefix exists
      NEW.referred_by := 'rafiki-' || NEW.referred_by;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for both insert and update
DROP TRIGGER IF EXISTS normalize_referral_code_on_insert ON users;
CREATE TRIGGER normalize_referral_code_on_insert
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION normalize_referral_code();

DROP TRIGGER IF EXISTS normalize_referral_code_on_update ON users;
CREATE TRIGGER normalize_referral_code_on_update
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION normalize_referral_code(); 