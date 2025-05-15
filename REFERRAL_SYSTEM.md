# Referral System

This document outlines how the referral system works in the application.

## Overview

The referral system allows users to refer others to the platform using unique referral codes. Each user gets a unique referral code that they can share with others. When a new user signs up using a referral code, the referrer gets credit for the referral.

## Database Schema

### Users Table
- `id`: Unique identifier for the user (UUID)
- `referral_code`: Unique code used for referrals (format: `rafiki-XXXXXXX`)
- `referred_by`: The referral code of the user who referred this user (optional)
- `created_at`: When the user was created
- `updated_at`: When the user was last updated

### Referrals Table
- `id`: Unique identifier for the referral
- `referrer_id`: ID of the user who made the referral
- `referred_id`: ID of the user who was referred
- `status`: Status of the referral (e.g., 'pending', 'completed')
- `created_at`: When the referral was created

## How It Works

1. **User Registration**:
   - When a user signs up, they can enter a referral code (optional)
   - If a referral code is provided, the system validates it and records the referral
   - A new unique referral code is generated for the new user

2. **Referral Code Generation**:
   - Each referral code is prefixed with `rafiki-` followed by a random 8-character string
   - The system ensures all referral codes are unique

3. **Referral Tracking**:
   - When a user signs up with a referral code, a record is created in the `referrals` table
   - The referring user's `referred_by` field is updated with the referrer's user ID

## Maintenance

### Verifying Referral Codes

To check the status of referral codes in your database, run:

```bash
tsx scripts/verify-referral-codes.ts
```

This will generate a report showing:
- Total number of users
- Number of users with valid referral codes
- Number of users with missing referral codes
- Number of users with invalid referral code formats

### Fixing Missing or Invalid Referral Codes

If you find users with missing or invalid referral codes, you can run the database migration to fix them:

```bash
npm run supabase db push
```

This will apply the latest migrations, including the one that ensures all users have valid referral codes.

## Troubleshooting

### Common Issues

1. **Duplicate Referral Codes**:
   - The system enforces uniqueness on the `referral_code` column
   - If you encounter duplicate codes, run the verification script to identify and fix them

2. **Invalid Referral Codes**:
   - All referral codes should start with `rafiki-`
   - Use the verification script to identify any codes that don't match this format

3. **Missing Referral Codes**:
   - New users should automatically get a referral code
   - If any users are missing codes, run the database migration to generate them
