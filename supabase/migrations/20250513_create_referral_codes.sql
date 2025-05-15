-- Create referral_codes table
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  code text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id),
  UNIQUE (code)
);

-- Add RLS policies
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own referral code
CREATE POLICY "Users can read their own referral code"
  ON public.referral_codes
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Allow service role to manage all referral codes
CREATE POLICY "Service role can manage all referral codes"
  ON public.referral_codes
  USING (auth.jwt()->>'role' = 'service_role');

-- Create function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_unique_referral_code()
RETURNS text AS $$
DECLARE
  code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Generate a random 8-character code using alphanumeric characters
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS (
      SELECT 1 FROM public.referral_codes WHERE code = code
    ) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Create trigger to generate referral code on insert
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.code IS NULL THEN
    NEW.code := generate_unique_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_referral_code_trigger
  BEFORE INSERT ON public.referral_codes
  FOR EACH ROW
  EXECUTE FUNCTION set_referral_code();

-- Create trigger to update updated_at timestamp
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.referral_codes
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime('updated_at');

-- Create index for faster lookups
CREATE INDEX referral_codes_user_id_idx ON public.referral_codes (user_id);
CREATE INDEX referral_codes_code_idx ON public.referral_codes (code);

-- Grant permissions
GRANT SELECT ON public.referral_codes TO authenticated;
GRANT SELECT ON public.referral_codes TO service_role;
