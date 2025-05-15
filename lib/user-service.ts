import { supabase } from './supabase';

interface UserData {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  emailVerified?: boolean;
}

export async function saveUserToSupabase(userData: UserData) {
  if (!supabase) {
    console.error('Supabase client is not initialized');
    throw new Error('Database service is not available');
  }

  try {
    // Use the singleton Supabase client instance
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('No active session found:', sessionError);
      throw new Error('No active session found');
    }
    
    // Check if user already exists
    const { data: existingUser, error: getError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userData.id)
      .single();

    if (getError && getError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking for existing user:', getError);
      throw getError;
    }

    const now = new Date().toISOString();
    const userDataToSave = {
      email: userData.email,
      full_name: userData.fullName,
      avatar_url: userData.avatarUrl,
      email_verified: userData.emailVerified,
      last_sign_in: now,
      updated_at: now,
    };

    if (existingUser) {
      // Update existing user
      const { data, error } = await supabase
        .from('users')
        .update(userDataToSave)
        .eq('clerk_id', userData.id)
        .select();

      if (error) {
        console.error('Error updating user:', error);
        throw error;
      }

      return data;
    } else {
      // Create new user
      const { data, error } = await supabase
        .from('users')
        .insert([{
          ...userDataToSave,
          clerk_id: userData.id,
          created_at: now,
        }])
        .select();

      if (error) {
        console.error('Error creating user:', error);
        throw error;
      }

      return data;
    }
  } catch (error) {
    console.error('Error in saveUserToSupabase:', error);
    throw error;
  }
}

export async function getUserFromSupabase(userId: string) {
  if (!supabase) {
    console.error('Supabase client is not initialized');
    throw new Error('Database service is not available');
  }

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('No active session found:', sessionError);
      throw new Error('No active session found');
    }
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null;
      }
      console.error('Error fetching user:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserFromSupabase:', error);
    throw error;
  }
}