import { createAdminClient } from '@/lib/supabase/server';
import { apiResponse, apiError } from '@/lib/api-utils';
import { Database } from '@/lib/supabase/database.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

type Task = Database['public']['Tables']['tasks']['Row'];

interface TasksResponse {
  tasks: Task[];
  meta: {
    total: number;
    hasMore: boolean;
  };
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;
    const { status, userId } = await request.json();

    console.log(`Updating task ${taskId} status to ${status} for user ${userId}`);

    if (!taskId || !userId) {
      const errorMsg = 'Task ID and User ID are required';
      console.error(errorMsg);
      return apiError(errorMsg, 400);
    }

    const supabase = await createAdminClient();
    if (!supabase) {
      const errorMsg = 'Failed to initialize Supabase client';
      console.error(errorMsg);
      return apiError(errorMsg, 500);
    }

    // Verify the task exists and belongs to the user
    const { data: existingTask, error: fetchError } = await (supabase as SupabaseClient<Database>)
      .from('tasks')
      .select('id')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingTask) {
      const errorMsg = 'Task not found or access denied';
      console.error(errorMsg, { fetchError });
      return apiError(errorMsg, 404);
    }

    // Update the task status
    const { data: updatedTask, error: updateError } = await (supabase as SupabaseClient<Database>)
      .from('tasks')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating task status:', updateError);
      return apiError('Failed to update task status', 500, updateError.message);
    }

    console.log(`Successfully updated task ${taskId} status to ${status}`);
    return apiResponse({ task: updatedTask });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating task status:', error);
    return apiError('Internal server error', 500, errorMsg);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    console.log('API Request - Fetching tasks for user:', userId);

    if (!userId) {
      const errorMsg = 'User ID is required';
      console.error(errorMsg);
      return apiError(errorMsg, 400);
    }

    const supabase = await createAdminClient();
    if (!supabase) {
      const errorMsg = 'Failed to initialize Supabase client';
      console.error(errorMsg);
      return apiError(errorMsg, 500);
    }

    // First, check if there are any tasks in the database
    const allTasksQuery = await (supabase as SupabaseClient<Database>)
      .from('tasks')
      .select('*')
      .limit(5);

    console.log('All tasks in database (sample):', {
      data: allTasksQuery.data,
      error: allTasksQuery.error,
      count: allTasksQuery.data?.length || 0
    });

    // Log the user ID being used for the query
    console.log('Querying tasks for user ID:', `'${userId.trim()}'`);

    // Get the user's tasks
    const { data, error, count } = await (supabase as SupabaseClient<Database>)
      .from('tasks')
      .select('*', { count: 'exact' })
      .eq('user_id', userId.trim()) // Trim any whitespace
      .order('created_at', { ascending: false });

    console.log('Tasks query result:', {
      userId: userId.trim(),
      count,
      data: data ? `Array(${data.length})` : 'null',
      error: error?.message || 'No error',
      hasData: !!data
    });

    // Log the SQL query being executed
    if (error) {
      console.error('Supabase query details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    }

    if (error) {
      console.error('Supabase error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return apiError('Failed to fetch tasks', 500, error.message);
    }

    // Ensure data is an array
    const tasks = Array.isArray(data) ? data : [];
    console.log(`Returning ${tasks.length} tasks`);
    
    const response: TasksResponse = { 
      tasks: tasks as Task[],
      meta: {
        total: count || 0,
        hasMore: false
      }
    };
    
    return apiResponse(response);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in tasks API:', {
      message: errorMsg,
      stack: error instanceof Error ? error.stack : undefined
    });
    return apiError('Internal server error', 500, errorMsg);
  }
}