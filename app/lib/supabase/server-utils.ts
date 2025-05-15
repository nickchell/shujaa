// This file contains server-side only utilities for Supabase
'use server';

import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// This file should only be imported in Server Components or API routes
// Add a runtime check to prevent usage in client components
if (typeof window !== 'undefined') {
  console.error('Server utilities cannot be imported in client components');
  throw new Error('Server utilities cannot be imported in client components');
}

// Define a basic Database type if not available
type Database = any; // Replace with your actual database types if available

// Regular server client with user context
export async function createServerClient() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      const missingVars = [];
      if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
      if (!supabaseKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
      
      const errorMessage = `Missing required environment variables for Supabase client: ${missingVars.join(', ')}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    // Get cookies from the request - ensure this is awaited
    const cookieStore = await cookies();
    
    // Create a simple cookie handler
    const cookieHandler = {
      get(name: string): string | undefined {
        try {
          return cookieStore.get(name)?.value;
        } catch (error) {
          console.error('Error getting cookie:', error);
          return undefined;
        }
      },
      set(name: string, value: string, options: any = {}): void {
        try {
          cookieStore.set({
            name,
            value,
            ...options,
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
          });
        } catch (error) {
          console.error('Error setting cookie:', error);
        }
      },
      remove(name: string, options: any = {}): void {
        try {
          cookieStore.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
            path: '/',
          });
        } catch (error) {
          console.error('Error removing cookie:', error);
        }
      },
    };

    // Create a client with cookie handlers
    const client = createSupabaseServerClient<Database>(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          get: (name) => cookieHandler.get(name),
          set: (name, value, options) => {
            cookieHandler.set(name, value, options);
            return Promise.resolve();
          },
          remove: (name, options) => {
            cookieHandler.remove(name, options);
            return Promise.resolve();
          },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: true,
        },
      }
    );
    
    return client;
  } catch (error) {
    console.error('Failed to create Supabase server client:', error);
    throw error; // Re-throw to allow error handling by the caller
  }
}

// Admin client for server-side operations (bypasses RLS)
export async function createAdminClient(): Promise<SupabaseClient<Database> | null> {
  const startTime = Date.now();
  console.log('[createAdminClient] Starting admin client creation...');
  
  try {
    if (typeof window !== 'undefined') {
      const errorMsg = 'Admin client cannot be used in the browser';
      console.error('[createAdminClient] Error:', errorMsg);
      return null;
    }

    console.log('[createAdminClient] Checking environment variables...');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      const missingVars = [];
      if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
      if (!serviceRoleKey) missingVars.push('SUPABASE_SERVICE_ROLE_KEY');
      
      const errorMessage = `Missing required environment variables for Supabase admin client: ${missingVars.join(', ')}`;
      console.error('[createAdminClient] Error:', errorMessage);
      throw new Error(errorMessage);
    }

    console.log('[createAdminClient] Environment variables found');
    console.log(`[createAdminClient] Supabase URL: ${supabaseUrl ? '***' : 'not set'}`);
    console.log(`[createAdminClient] Service Role Key: ${serviceRoleKey ? '***' : 'not set'}`);
    
    console.log('[createAdminClient] Creating Supabase client...');
    const client = createClient<Database>(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    );
    
    // Test the connection
    console.log('[createAdminClient] Testing database connection...');
    const { data: _, error } = await client.from('users').select('*').limit(1);
    
    if (error) {
      console.error('[createAdminClient] Database connection test failed:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Failed to connect to Supabase: ${error.message}`);
    }
    
    const duration = Date.now() - startTime;
    console.log(`[createAdminClient] Successfully created and connected to Supabase in ${duration}ms`);
    return client;
  } catch (error) {
    console.error('Failed to create Supabase admin client:', error);
    return null;
  }
}
