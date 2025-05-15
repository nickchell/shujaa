'server-only';

// Re-export from the new location in the app directory
export { createServerClient, createAdminClient } from '@/app/lib/supabase/server-utils';

// Re-export types
export type { Database } from '@/types/supabase';