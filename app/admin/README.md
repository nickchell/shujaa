# Admin Section

This directory contains the admin interface for managing the application configuration.

## Available Routes

- `/admin/referral-config` - Configure the referral URL settings

## Referral URL Configuration

The referral URL configuration allows you to change the base URL and path used for generating referral links without modifying the code.

### How to Update the Referral URL

1. Navigate to `/admin/referral-config` in your browser
2. Update the following fields:
   - **Base URL**: The root URL of your application (e.g., `https://yourapp.com`)
   - **Referral Path**: The path where users land when they use a referral link (e.g., `/welcome`)
3. Click "Save Changes" to apply the updates

### How It Works

1. The configuration is stored in the `app_config` table in the database
2. The application loads the configuration on startup
3. All referral links are generated using the configured values
4. Changes take effect immediately after saving

### Database Schema

The configuration is stored in the `app_config` table with the following structure:

```sql
CREATE TABLE public.app_config (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Permissions

Only users with the `admin` role can access the admin interface and modify the configuration.
