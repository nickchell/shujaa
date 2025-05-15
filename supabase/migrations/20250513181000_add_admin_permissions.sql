-- Create admin role if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin') THEN
    CREATE ROLE admin WITH NOLOGIN NOSUPERUSER INHERIT NOCREATEDB NOCREATEROLE NOREPLICATION;
  END IF;
END
$$;

-- Grant necessary permissions on app_config table
GRANT SELECT, INSERT, UPDATE ON TABLE public.app_config TO admin;
GRANT USAGE, SELECT ON SEQUENCE public.app_config_id_seq TO admin;

-- Create or replace function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
DECLARE
  user_id uuid;
  is_admin boolean;
BEGIN
  -- Get the current user ID from JWT claims
  user_id := auth.uid();
  
  -- Check if the user has the admin role
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users u
    JOIN auth.user_roles ur ON u.id = ur.user_id
    JOIN auth.roles r ON ur.role_id = r.id
    WHERE u.id = user_id AND r.name = 'admin'
  ) INTO is_admin;
  
  RETURN is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a policy to allow admin access to app_config
DROP POLICY IF EXISTS "Admins can manage app config" ON public.app_config;
CREATE POLICY "Admins can manage app config"
ON public.app_config
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Create a function to get the referral config
CREATE OR REPLACE FUNCTION public.get_referral_config()
RETURNS json AS $$
BEGIN
  RETURN (
    SELECT value 
    FROM public.app_config 
    WHERE key = 'referral'
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_referral_config() TO authenticated;
