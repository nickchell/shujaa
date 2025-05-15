-- Begin transaction
BEGIN;

-- Drop the referral_codes table since we already have referral_code in users table
DROP TABLE IF EXISTS public.referral_codes;

-- Drop the functions that were used by the referral_codes table
DROP FUNCTION IF EXISTS generate_unique_referral_code();
DROP FUNCTION IF EXISTS set_referral_code();

-- Update the users table trigger to ensure uniqueness
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER AS $$
DECLARE
  code text;
  code_exists boolean;
  prefix text := 'rafiki-';
  code_length int := 8; -- Length of the random part
  random_part text;
BEGIN
  IF NEW.referral_code IS NULL THEN
    LOOP
      -- Generate a random string for the code part
      random_part := upper(substring(md5(random()::text), 1, code_length));
      
      -- Ensure the code is properly prefixed
      IF random_part IS NULL OR random_part = '' THEN
        random_part := upper(substring(md5(gen_random_uuid()::text), 1, code_length));
      END IF;
      
      -- Combine prefix with random part
      code := prefix || random_part;
      
      -- Check if code exists
      SELECT EXISTS (
        SELECT 1 FROM public.users WHERE referral_code = code
      ) INTO code_exists;
      
      -- Exit if unique
      EXIT WHEN NOT code_exists;
    END LOOP;
    
    NEW.referral_code := code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger to use the updated function
DROP TRIGGER IF EXISTS set_referral_code ON public.users;
CREATE TRIGGER set_referral_code
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_referral_code();

-- Make sure referral_code is unique
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_referral_code_key;
ALTER TABLE public.users ADD CONSTRAINT users_referral_code_key UNIQUE (referral_code);

-- Commit transaction
COMMIT;
