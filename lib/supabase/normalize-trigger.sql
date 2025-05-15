-- Create a function to normalize referral codes
CREATE OR REPLACE FUNCTION normalize_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if there's a referral code
  IF NEW.referral_code IS NOT NULL THEN
    -- If the referral code doesn't start with 'rafiki-', normalize it
    IF NEW.referral_code NOT LIKE 'rafiki-%' THEN
      -- If it has some other prefix like 'shuj-', replace it
      IF position('-' in NEW.referral_code) > 0 THEN
        NEW.referral_code := 'rafiki-' || split_part(NEW.referral_code, '-', 2);
      ELSE
        -- If it has no prefix, add one
        NEW.referral_code := 'rafiki-' || NEW.referral_code;
      END IF;
    END IF;
  END IF;

  -- Do the same for referred_by if it exists
  IF NEW.referred_by IS NOT NULL THEN
    IF NEW.referred_by NOT LIKE 'rafiki-%' THEN
      IF position('-' in NEW.referred_by) > 0 THEN
        NEW.referred_by := 'rafiki-' || split_part(NEW.referred_by, '-', 2);
      ELSE
        NEW.referred_by := 'rafiki-' || NEW.referred_by;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the trigger
DROP TRIGGER IF EXISTS normalize_referral_code_trigger ON users;
CREATE TRIGGER normalize_referral_code_trigger
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION normalize_referral_code(); 