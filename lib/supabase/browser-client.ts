// Import the Supabase client instance
import { supabase } from './client';
import type { SupabaseClient } from '@supabase/supabase-js';

// Export the client instance as createBrowserClient for backward compatibility
export const createBrowserClient = () => supabase;

// Export the SupabaseClient type
export type { SupabaseClient };
