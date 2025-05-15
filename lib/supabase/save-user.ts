import { User } from '@clerk/nextjs/server';
import { supabase } from '../supabase';

// Reuse the existing Supabase client
type SupabaseClient = typeof supabase;

interface UserInsertData {
  id: string;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  provider?: string;
  referral_code?: string;
  referred_by?: string | null;
  created_at?: string;
  updated_at?: string;
}



interface SaveUserParams {
  userId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  imageUrl?: string;
  referredBy?: string;
}

export async function saveUserToSupabase({
  userId,
  email,
  firstName,
  lastName,
  fullName,
  imageUrl,
  referredBy
}: SaveUserParams) {
  const startTime = Date.now();
  console.log(`[saveUserToSupabase] Starting for user ${userId}`);
  
  try {
    if (!userId) {
      const errorMsg = 'User ID is required';
      console.error('[saveUserToSupabase] Error:', errorMsg);
      throw new Error(errorMsg);
    }

    // Log input parameters (safely)
    console.log('[saveUserToSupabase] Input parameters:', {
      userId,
      email: email ? '[email]' : 'not provided',
      fullName: fullName ? '[name]' : 'not provided',
      hasReferralCode: !!referredBy
    });

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.warn(`[saveUserToSupabase] Invalid email format: ${email}`);
      // Don't fail, just log a warning
    }

    // Since we're using Clerk for authentication, we don't need to get the user from Supabase auth
    // Instead, we'll use the user data passed from Clerk
    console.log('[saveUserToSupabase] Using Clerk user data');
    
    // Create a user data object from the Clerk user data
    const userData = {
      id: userId,
      email: email || null,
      full_name: fullName || `${firstName || ''} ${lastName || ''}`.trim() || null,
      avatar_url: imageUrl || null,
      provider: 'clerk',
      referral_code: `${process.env.NEXT_PUBLIC_REFERRAL_CODE_PREFIX}-${userId.slice(-8).toUpperCase()}`,
      referred_by: referredBy || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    // PGRST116 means no rows found, which is expected for new users
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking for existing user:', fetchError);
      throw fetchError;
    }

    // Process and standardize the referredBy code if provided
    if (referredBy) {
      console.log(`Processing referral code: ${referredBy}`);
      
      // Use the existing referral code format from userData if available
      const prefix = process.env.NEXT_PUBLIC_REFERRAL_CODE_PREFIX || 'rafiki-';
      
      // If the referredBy already has the prefix, use it as is
      if (referredBy.startsWith(prefix)) {
        userData.referred_by = referredBy;
      } else {
        // Otherwise, add the prefix
        userData.referred_by = `${prefix}${referredBy.replace(prefix, '')}`;
      }
      
      // Check if the code exists
      const { data: referrer, error: referrerError } = await supabase
        .from('users')
        .select('id, referral_code')
        .eq('referral_code', userData.referred_by || '')
        .single();
        
      if (referrerError) {
        console.error('Error checking referrer:', referrerError);
        // Don't fail if referrer check fails, just log it
      } else if (referrer) {
        console.log(`Found referrer: ${referrer.id} with code ${referrer.referral_code}`);
        // Keep the referred_by value we already set
      } else {
        console.log(`No referrer found with code: ${userData.referred_by}`);
        // Don't fail if referrer not found, just set to null
        userData.referred_by = null;
      }
    }

    // If user doesn't exist, insert them
    if (!existingUser) {
      console.log('[saveUserToSupabase] Inserting new user:', userData);
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting user:', insertError);
        throw insertError;
      }

      return newUser;
    } else {
      // User exists, update their information
      console.log('[saveUserToSupabase] Updating existing user:', userData);
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update(userData)
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating user:', updateError);
        throw updateError;
      }

      return updatedUser;
    }
  } catch (error) {
    console.error('Error in saveUserToSupabase:', error);
    throw error;
  }
}