import { supabase } from '../supabase';
import type { User } from '@clerk/nextjs';

export async function syncClerkWithSupabase(clerkUser: User) {
  if (!clerkUser) {
    console.log('No Clerk user provided');
    return null;
  }

  try {
    // Check if Clerk is available in the window object
    if (typeof window === 'undefined' || !window.Clerk) {
      console.error('Clerk is not available in the current context');
      return null;
    }

    // Get the JWT from Clerk
    console.log('Getting JWT token from Clerk...');
    const token = await window.Clerk.session?.getToken({
      template: 'supabase'
    });
    
    if (!token) {
      console.error('No JWT token available from Clerk');
      return null;
    }

    console.log('Setting Supabase session with JWT token...');
    
    // Set the session in Supabase
    const { data, error } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: ''
    });

    if (error) {
      console.error('Error setting Supabase session:', error);
      return null;
    }

    console.log('Successfully synced Clerk with Supabase');
    return data.session;
  } catch (error) {
    console.error('Error syncing Clerk with Supabase:', error);
    return null;
  }
}
