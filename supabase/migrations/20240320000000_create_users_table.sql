-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    provider TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT
    USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE
    USING (auth.uid()::text = id::text);

-- Add insert policy to allow saving user data
CREATE POLICY "Allow inserting user data" ON public.users
    FOR INSERT
    WITH CHECK (true);  -- Allow all inserts since we're using Clerk for auth

-- Create indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_provider_idx ON public.users(provider);

-- Add comments
COMMENT ON TABLE public.users IS 'Stores user information from authentication providers';
COMMENT ON COLUMN public.users.id IS 'Unique identifier from the auth provider';
COMMENT ON COLUMN public.users.email IS 'User email address';
COMMENT ON COLUMN public.users.full_name IS 'User full name';
COMMENT ON COLUMN public.users.avatar_url IS 'URL to user avatar image';
COMMENT ON COLUMN public.users.provider IS 'Authentication provider (e.g., google)';
COMMENT ON COLUMN public.users.updated_at IS 'Last update timestamp';
COMMENT ON COLUMN public.users.created_at IS 'Record creation timestamp'; 