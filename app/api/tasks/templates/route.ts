import { createAdminClient } from '@/lib/supabase/server';
import { apiResponse, apiError } from '@/lib/api-utils';

export async function GET() {
  try {
    const supabaseAdmin = await createAdminClient();
    
    if (!supabaseAdmin) {
      return apiError('Failed to initialize Supabase admin client', 500);
    }

    const { data: templates, error } = await supabaseAdmin
      .from('task_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return apiError('Failed to fetch task templates', 500, error.message);
    }

    return apiResponse({ templates });
  } catch (error) {
    console.error('Error fetching task templates:', error);
    return apiError(
      'Failed to fetch task templates', 
      500, 
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
