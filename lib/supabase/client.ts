import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

type Database = any; // Replace with your actual database types if available

// Global variable to hold the singleton instance
declare global {
  // eslint-disable-next-line no-var
  var __supabaseClient: SupabaseClient<Database> | undefined;
}

/**
 * Creates a new Supabase client instance with proper configuration
 */
function createSupabaseClientInstance(): SupabaseClient<Database> {
  if (!env.supabase.url || !env.supabase.anonKey) {
    throw new Error('Missing required Supabase configuration. Please check your environment variables.');
  }
  
  return createSupabaseClient<Database>(
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
function getSupabaseClient(): SupabaseClient<Database> {
  // In development, use a global variable to preserve the client across hot-reloads
  if (process.env.NODE_ENV === 'development') {
    if (!global.__supabaseClient) {
      global.__supabaseClient = createSupabaseClientInstance();
    }
    return global.__supabaseClient;
  }

  // In production, use a module-level variable
  if (!globalThis.__supabaseClient) {
    globalThis.__supabaseClient = createSupabaseClientInstance();
  }
  return globalThis.__supabaseClient;
}

// Create the singleton instance
const supabase = getSupabaseClient();

// Export the configured client instance
export { supabase };

// Export as default for backward compatibility
export default supabase;

// Check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return !!(env.supabase.url && env.supabase.anonKey);
};