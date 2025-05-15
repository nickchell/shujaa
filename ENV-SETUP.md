# Environment Variables Setup

This document explains how to set up the required environment variables for Rafiki Rewards app.

## Required Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test...
CLERK_SECRET_KEY=sk_test...
CLERK_WEBHOOK_SECRET=whsec_...

# Application settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Where to Find These Values

### Supabase Variables

1. Log in to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to Project Settings > API
4. You'll find:
   - `NEXT_PUBLIC_SUPABASE_URL`: The URL for your Supabase project
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The "anon" public key
   - `SUPABASE_SERVICE_ROLE_KEY`: The "service_role" secret key (keep this secure!)

### Clerk Variables

1. Log in to your [Clerk Dashboard](https://dashboard.clerk.dev/)
2. Select your application
3. Go to API Keys
4. You'll find:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: The publishable key
   - `CLERK_SECRET_KEY`: The secret key
5. For the webhook secret:
   - Go to Webhooks in the Clerk dashboard
   - Create a webhook endpoint pointing to `https://your-domain.com/api/webhooks/clerk`
   - The signing secret is your `CLERK_WEBHOOK_SECRET`

### Application Settings

- `NEXT_PUBLIC_APP_URL`: The base URL of your application
  - Use `http://localhost:3000` for local development
  - Use your actual domain (e.g., `https://rafiki-rewards.vercel.app`) for production

## Checking Environment Variables

Run the check script to verify your environment variables:

```bash
node scripts/check-env.js
```

## Troubleshooting

If you see errors like "missing environment variable" or HTTP 500 status codes:

1. Verify your `.env.local` file exists and contains all required variables
2. Check for typos in your variable names and values
3. Restart your development server after making changes:
   ```bash
   npm run dev
   ```
4. Make sure your API keys have the correct permissions 