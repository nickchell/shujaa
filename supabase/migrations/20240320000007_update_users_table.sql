-- Drop existing policies and indexes
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Allow inserting user data" ON public.users;
DROP INDEX IF EXISTS users_email_idx;
DROP INDEX IF EXISTS users_provider_idx;

-- Drop dependent tables first
DROP TABLE IF EXISTS public.referrals;
DROP TABLE IF EXISTS public.referral_stats;

-- Create a temporary table with the new schema
CREATE TABLE IF NOT EXISTS public.users_new (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    provider TEXT DEFAULT 'clerk',
    referral_code TEXT UNIQUE,
    referred_by TEXT REFERENCES public.users_new(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Copy data from old table to new table
INSERT INTO public.users_new (id, email, full_name, avatar_url, updated_at, created_at)
SELECT id::text, email, full_name, avatar_url, updated_at, created_at
FROM public.users;

-- Drop the old table
DROP TABLE public.users;

-- Rename the new table
ALTER TABLE public.users_new RENAME TO users;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_provider_idx ON public.users(provider);
CREATE INDEX IF NOT EXISTS users_referral_code_idx ON public.users(referral_code);

-- Recreate policies
CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT
    USING (auth.uid()::text = id);

CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE
    USING (auth.uid()::text = id);

CREATE POLICY "Allow inserting user data" ON public.users
    FOR INSERT
    WITH CHECK (true);

-- Create referral_stats table
CREATE TABLE IF NOT EXISTS public.referral_stats (
    user_id TEXT PRIMARY KEY REFERENCES public.users(id),
    total_referrals INTEGER DEFAULT 0,
    completed_referrals INTEGER DEFAULT 0,
    pending_referrals INTEGER DEFAULT 0,
    total_rewards INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id TEXT REFERENCES public.users(id),
    referred_id TEXT REFERENCES public.users(id),
    status TEXT CHECK (status IN ('pending', 'completed', 'invalid')) DEFAULT 'pending',
    reward_granted BOOLEAN DEFAULT FALSE,
    reward_type TEXT,
    reward_amount INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create function to generate referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := 'rafiki-' || substring(md5(random()::text), 1, 8);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for referral code generation
DROP TRIGGER IF EXISTS set_referral_code ON public.users;
CREATE TRIGGER set_referral_code
    BEFORE INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_referral_code();

-- Create function to initialize referral stats
CREATE OR REPLACE FUNCTION public.initialize_referral_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.referral_stats (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for referral stats initialization
DROP TRIGGER IF EXISTS init_referral_stats ON public.users;
CREATE TRIGGER init_referral_stats
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.initialize_referral_stats(); 