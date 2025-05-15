-- Migration to ensure all users have a referral code with the correct prefix
BEGIN;

-- Create a function to generate a referral code for users who don't have one
CREATE OR REPLACE FUNCTION public.generate_missing_referral_codes()
RETURNS void AS $$
DECLARE
  user_record RECORD;
  new_code TEXT;
  code_exists BOOLEAN;
  prefix TEXT := 'rafiki-';
  code_length INT := 8;
BEGIN
  -- Loop through all users without a referral code
  FOR user_record IN 
    SELECT id FROM public.users 
    WHERE referral_code IS NULL OR referral_code = ''
  LOOP
    -- Generate a unique code for this user
    LOOP
      -- Generate a random string for the code part
      new_code := prefix || upper(substring(md5(random()::text), 1, code_length));
      
      -- Check if code exists
      SELECT EXISTS (
        SELECT 1 FROM public.users WHERE referral_code = new_code
      ) INTO code_exists;
      
      -- Exit if unique
      EXIT WHEN NOT code_exists;
    END LOOP;
    
    -- Update the user with the new referral code
    UPDATE public.users 
    SET referral_code = new_code,
        updated_at = NOW()
    WHERE id = user_record.id;
    
    RAISE NOTICE 'Assigned referral code % to user %', new_code, user_record.id;
  END LOOP;
  
  -- Also fix any codes that don't have the prefix
  FOR user_record IN 
    SELECT id, referral_code 
    FROM public.users 
    WHERE referral_code IS NOT NULL 
    AND referral_code != ''
    AND NOT referral_code LIKE 'rafiki-%'
  LOOP
    -- Generate a new code with the prefix
    LOOP
      -- Generate a random string for the code part
      new_code := prefix || upper(substring(md5(random()::text), 1, code_length));
      
      -- Check if code exists
      SELECT EXISTS (
        SELECT 1 FROM public.users WHERE referral_code = new_code
      ) INTO code_exists;
      
      -- Exit if unique
      EXIT WHEN NOT code_exists;
    END LOOP;
    
    -- Update the user with the new referral code
    UPDATE public.users 
    SET referral_code = new_code,
        updated_at = NOW()
    WHERE id = user_record.id;
    
    RAISE NOTICE 'Updated referral code from % to % for user %', 
      user_record.referral_code, new_code, user_record.id;
  END LOOP;
  
  -- Ensure the unique constraint is in place
  ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_referral_code_key;
  ALTER TABLE public.users ADD CONSTRAINT users_referral_code_key UNIQUE (referral_code);
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Run the function to fix missing or invalid referral codes
SELECT public.generate_missing_referral_codes();

-- Clean up the function
DROP FUNCTION IF EXISTS public.generate_missing_referral_codes();

COMMIT;
