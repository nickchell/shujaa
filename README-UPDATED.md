# Fixing Supabase for Clerk Integration

This guide helps you fix the Supabase database to work with Clerk authentication. The main issue is that Supabase tables use UUID for IDs, but Clerk provides text-based IDs.

## The Problem

When you see this error:
```
ERROR: 0A000: cannot alter type of a column used in a policy definition
DETAIL: policy Users can view their own data on table users depends on column "id"
```

It means we need to take a more sophisticated approach to fixing the database.

## Solution: Table Recreation Approach

The most reliable solution is to:
1. Create new tables with the correct data types
2. Copy data from the old tables
3. Drop the old tables
4. Rename the new tables

This avoids problems with dependencies and policies.

## How to Fix

### Option 1: Using the Direct Script (Recommended)

1. Install required dependencies:
   ```bash
   npm install @supabase/supabase-js dotenv
   ```

2. Create a `.env` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. Run the direct fix script:
   ```bash
   node direct-sql-fix.js
   ```

### Option 2: Using pgAdmin or psql

If you have direct database access, you can run the SQL directly:

1. Connect to your Supabase database using pgAdmin or psql
2. Run the contents of `fix-db-direct.sql`

## What This Fixes

1. Changes all ID columns from UUID to TEXT
2. Updates foreign key constraints to match the new data types
3. Recreates all Row Level Security policies
4. Preserves all your existing data
5. Fixes the referral system to work with Clerk's auth

## After the Fix

Once the fix is applied, your app should:
1. Save user data properly to Supabase
2. Handle referral links correctly
3. Not produce errors when users sign up through referral links

You may need to restart your app if it's already running to see the changes take effect. 