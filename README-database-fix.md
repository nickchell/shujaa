# Fixing the Database for Clerk Integration

This guide explains how to fix the database structure to work with Clerk authentication service.

## The Issue

The current database schema uses UUID for user IDs, but Clerk provides string IDs (like "user_123abc"). This causes errors when trying to save users to Supabase.

## Solution

We need to update the database schema to use TEXT data type for ID columns instead of UUID.

## Instructions

### Option 1: Using Supabase CLI (Recommended)

1. Make sure the Supabase CLI is installed:
   ```bash
   npm install -g supabase
   ```

2. Run the migration:
   ```bash
   npx supabase db reset
   ```

### Option 2: Using the SQL File Directly

If you have access to psql, you can run the SQL file directly:

```bash
psql -h [supabase_host] -U postgres -d postgres -f fix-db.sql
```

Replace `[supabase_host]` with your actual Supabase host.

### Option 3: Using the JavaScript Script

1. Make sure you have the required dependencies:
   ```bash
   npm install @supabase/supabase-js dotenv
   ```

2. Create a `.env` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. Run the script:
   ```bash
   node apply-migration.js
   ```

## After Migration

Once the migration is complete, restart your application. The database should now accept Clerk's text-based user IDs, and referrals should work correctly. 