-- Create a table to store app configuration
CREATE TABLE IF NOT EXISTS public.app_config (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_app_config_key ON public.app_config (key);

-- Add referral URL configuration
INSERT INTO public.app_config (key, value, description)
VALUES ('referral', 
  '{"baseUrl": "https://england-bowling-lemon-penguin.trycloudflare.com", "referralPath": "/welcome"}',
  'Referral URL configuration including base URL and path')
ON CONFLICT (key) DO NOTHING;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at column
CREATE TRIGGER update_app_config_updated_at
BEFORE UPDATE ON public.app_config
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANTANT SELECT ON public.app_config TO authenticated;
GRANT ALL PRIVILEGES ON public.app_config TO service_role;
