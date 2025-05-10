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
    const supabase = await supabaseClient(token);
    
    // Check if user already exists
    const { data: existingUser, error: getError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userData.id)
      .single();

    if (getError && getError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw getError;
    }

    if (existingUser) {
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
        throw error;
      }

      return data;
    } else {
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
        throw error;
      }

      return data;
    }
  } catch (error) {
    throw error;
  }
}

export async function getUserFromSupabase(userId: string, token: string) {
  try {
    const supabase = await supabaseClient(token);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
} 