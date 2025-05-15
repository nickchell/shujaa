import { createAdminClient } from '@/lib/supabase/server';
import { apiResponse, apiError } from '@/lib/api-utils';
import { Database } from '@/lib/supabase/database.types';
import { SupabaseClient } from '@supabase/supabase-js';

type Task = Database['public']['Tables']['tasks']['Row'];

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('PATCH request received');
    
    const taskId = params.id;
    console.log('Task ID from params:', taskId);
    
    const requestBody = await request.text();
    console.log('Request body:', requestBody);
    
    let status: string | undefined;
    let userId: string | undefined;
    
    try {
      const body = requestBody ? JSON.parse(requestBody) : {};
      status = body.status;
      userId = body.userId;
      console.log('Parsed request body:', { status, userId });
    } catch (e) {
      const errorMsg = 'Invalid request body';
      console.error(errorMsg, e);
      return apiError(errorMsg, 400);
    }

    console.log(`Updating task ${taskId} status to ${status} for user ${userId}`);

    if (!taskId || !userId || status === undefined) {
      const errorMsg = 'Task ID, status, and User ID are required';
      console.error(errorMsg, { taskId, status, userId });
      return apiError(errorMsg, 400);
    }

    console.log('Creating Supabase admin client...');
    const supabase = await createAdminClient();
    if (!supabase) {
      const errorMsg = 'Failed to initialize Supabase client';
      console.error(errorMsg);
      return apiError(errorMsg, 500);
    }

    console.log('Verifying task ownership...');
    // Verify the task exists and belongs to the user
    const { data: existingTask, error: fetchError } = await (supabase as SupabaseClient<Database>)
      .from('tasks')
      .select('id')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingTask) {
      const errorMsg = 'Task not found or access denied';
      console.error(errorMsg, { 
        taskId, 
        userId, 
        error: fetchError,
        existingTask
      });
      return apiError(errorMsg, 404);
    }

    console.log('Updating task status in database...');
    // Update the task status
    const updateData = { 
      status,
      updated_at: new Date().toISOString()
    };
    
    console.log('Update data:', updateData);
    
    const { data: updatedTask, error: updateError } = await (supabase as SupabaseClient<Database>)
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating task status in database:', {
        error: updateError,
        taskId,
        updateData
      });
      return apiError('Failed to update task status in database', 500, updateError.message);
    }

    console.log(`Successfully updated task ${taskId} status to ${status}`);
    return apiResponse({ task: updatedTask });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Unexpected error in PATCH handler:', {
      error,
      message: errorMsg,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return apiError('Internal server error', 500, errorMsg);
  }
}
