-- Fix the foreign key constraint for the referred_by column
-- First drop the existing foreign key constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_referred_by_fkey;

-- Now create the correct constraint that points to referral_code
ALTER TABLE public.users 
  ADD CONSTRAINT users_referred_by_fkey 
  FOREIGN KEY (referred_by) 
  REFERENCES public.users(referral_code);

-- Create a trigger to standardize referral codes before insertion/update
CREATE OR REPLACE FUNCTION public.standardize_referral_code()
RETURNS TRIGGER AS $$
DECLARE
  prefix TEXT := 'rafiki-';
  code TEXT;
BEGIN
  -- Only apply to non-null values
  IF NEW.referred_by IS NOT NULL THEN
    -- Check if it already has the prefix
    IF NOT NEW.referred_by LIKE prefix || '%' THEN
      -- If it has a different prefix
      IF NEW.referred_by LIKE '%-' || '%' THEN
        -- Extract the part after the hyphen
        code := substring(NEW.referred_by from position('-' in NEW.referred_by) + 1);
        NEW.referred_by := prefix || code;
      ELSE
        -- No prefix at all, add it
        NEW.referred_by := prefix || NEW.referred_by;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to standardize the referred_by field
DROP TRIGGER IF EXISTS standardize_referred_by ON public.users;
CREATE TRIGGER standardize_referred_by
  BEFORE INSERT OR UPDATE OF referred_by ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.standardize_referral_code(); 