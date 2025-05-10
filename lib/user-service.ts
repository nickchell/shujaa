import { supabaseClient } from './supabaseClient';

interface UserData {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  emailVerified?: boolean;
}

export async function saveUserToSupabase(userData: UserData, token: string) {
  try {
    console.log('Starting saveUserToSupabase with data:', userData);
    
    const supabase = await supabaseClient(token);
    
    // Check if user already exists
    const { data: existingUser, error: getError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userData.id)
      .single();

    if (getError && getError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking existing user:', getError);
      throw getError;
    }

    if (existingUser) {
      console.log('User already exists, updating...');
      const { data, error } = await supabase
        .from('users')
        .update({
          email: userData.email,
          full_name: userData.fullName,
          avatar_url: userData.avatarUrl,
          email_verified: userData.emailVerified,
          last_sign_in: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_id', userData.id);

      if (error) {
        console.error('Error updating user:', error);
        throw error;
      }

      console.log('Successfully updated user in Supabase:', data);
      return data;
    } else {
      console.log('Creating new user...');
      const { data, error } = await supabase
        .from('users')
        .insert({
          clerk_id: userData.id,
          email: userData.email,
          full_name: userData.fullName,
          avatar_url: userData.avatarUrl,
          email_verified: userData.emailVerified,
          last_sign_in: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error creating user:', error);
        throw error;
      }

      console.log('Successfully created user in Supabase:', data);
      return data;
    }
  } catch (error) {
    console.error('Failed to save user to Supabase:', error);
    throw error;
  }
}

export async function getUserFromSupabase(userId: string, token: string) {
  try {
    console.log('Attempting to fetch user from Supabase:', userId);
    
    const supabase = await supabaseClient(token);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      throw error;
    }

    console.log('Successfully fetched user from Supabase:', data);
    return data;
  } catch (error) {
    console.error('Failed to fetch user from Supabase:', error);
    throw error;
  }
} 