// This file contains server-side actions for Supabase
'use server';

import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// This will throw an error if this module is imported in a client component
if (typeof window !== 'undefined') {
  throw new Error('This module can only be used in server components or API routes');
}

// Define a basic Database type if not available
type Database = any; // Replace with your actual database types if available

// Create a cookie store that works with Next.js 13+
async function createCookieStore() {
  // cookies() is async in Next.js 13+
  const cookieStore = await cookies();
  
  return {
    get(name: string) {
      return cookieStore.get(name)?.value;
    },
    set(name: string, value: string, options: any) {
      try {
        cookieStore.set(name, value, {
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
    remove(name: string, options: any = {}) {
      try {
        // @ts-ignore - set is a valid method
        cookieStore.set(name, '', {
          ...options,
          maxAge: 0,
          path: '/',
        });
      } catch (error) {
        console.error('Error removing cookie:', error);
      }
    },
  };
}

// Get server client with user context
export async function getServerClient() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing required environment variables for Supabase client');
      throw new Error('Missing required environment variables');
    }

    // Create a cookie store - await the async function
    const cookieStore = await createCookieStore();

    // Create a server client with the cookie store
    const supabase = createSupabaseServerClient<Database>(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name);
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options);
          },
          remove(name: string, options: any) {
            cookieStore.remove(name, options);
          },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: true,
          detectSessionInUrl: false,
        }
      }
    );

    return supabase;
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    throw error;
  }
}
