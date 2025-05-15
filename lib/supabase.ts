import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

type Database = any; // Replace with your actual database types if available

// Global variable to hold the singleton instance
declare global {
  // eslint-disable-next-line no-var
  var __supabaseClient: ReturnType<typeof createSupabaseClient> | undefined;
}

/**
 * Creates a new Supabase client instance with proper configuration
 */
function createSupabaseClientInstance() {
  if (!env.supabase.url || !env.supabase.anonKey) {
    throw new Error('Missing required Supabase configuration. Please check your environment variables.');
  }
  
  return createSupabaseClient(
    env.supabase.url,
    env.supabase.anonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );
}

/**
 * Returns the singleton Supabase client instance
 * Creates a new instance if one doesn't exist
 */
function getSupabaseClient() {
  // In development, use a global variable to persist the client across hot-reloads
  if (process.env.NODE_ENV === 'development') {
    if (!global.__supabaseClient) {
      global.__supabaseClient = createSupabaseClientInstance();
    }
    return global.__supabaseClient;
  }
  
  // In production, create a new instance each time
  return createSupabaseClientInstance();
}

// Create and export the singleton instance
const supabase = getSupabaseClient();

export { supabase, getSupabaseClient };

// Check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return !!(env.supabase.url && env.supabase.anonKey);
};

// Test the connection
(async () => {
  try {
    const { data, error } = await supabase.from('tasks').select('count').limit(1);
    if (error) {
      console.error('Supabase connection test failed:', error);
    } else {
      console.log('Supabase connection test successful');
    }
  } catch (err) {
    console.error('Supabase connection test error:', err);
  }
})();