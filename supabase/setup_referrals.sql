-- Create referral_codes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  code text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id),
  UNIQUE (code)
);

-- Enable RLS if not already enabled
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- Create or replace the read policy
DROP POLICY IF EXISTS "Users can read their own referral code" ON public.referral_codes;
CREATE POLICY "Users can read their own referral code"
  ON public.referral_codes
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Create function to generate unique referral codes
CREATE OR REPLACE FUNCTION generate_unique_referral_code()
RETURNS text AS $$
DECLARE
  code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Generate a random 8-character code
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code exists
    SELECT EXISTS (
      SELECT 1 FROM public.referral_codes WHERE code = code
    ) INTO code_exists;
    
    -- Exit if unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.code IS NULL THEN
    NEW.code := generate_unique_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS set_referral_code_trigger ON public.referral_codes;
CREATE TRIGGER set_referral_code_trigger
  BEFORE INSERT ON public.referral_codes
  FOR EACH ROW
  EXECUTE FUNCTION set_referral_code();

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS referral_codes_user_id_idx ON public.referral_codes (user_id);
CREATE INDEX IF NOT EXISTS referral_codes_code_idx ON public.referral_codes (code);

-- Grant permissions
GRANT SELECT ON public.referral_codes TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.referral_codes TO service_role;
