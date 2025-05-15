import { createClient } from '@supabase/supabase-js';
import { apiResponse, apiError } from '@/lib/api-utils';

export async function POST(request: Request) {
  try {
    const { taskId, userId } = await request.json();
    console.log('Task completion request received:', { taskId, userId });
    
    if (!taskId || !userId) {
      const error = 'Missing required fields';
      console.error(error, { taskId, userId });
      return apiError(error, 400, { taskId, userId });
    }

    // Create a Supabase client with the service role
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // First, verify the task exists and belongs to the user
    console.log('Verifying task ownership:', { taskId, userId });
    const { data: existingTask, error: fetchError } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingTask) {
      console.error('Task not found or access denied:', { taskId, userId, fetchError });
      return apiError('Task not found or access denied', 404, { taskId, userId });
    }

    // Update the task
    console.log('Updating task:', { taskId, userId });
    const { data: updatedTask, error: updateError } = await supabaseAdmin
      .from('tasks')
      .update({ 
        is_completed: true
      })
      .eq('id', taskId)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError || !updatedTask) {
      console.error('Error updating task:', updateError);
      return apiError('Failed to update task', 500, updateError?.message);
    }

    console.log('Task updated successfully:', {
      id: updatedTask.id,
      title: updatedTask.title,
      userId: updatedTask.user_id,
      isCompleted: updatedTask.is_completed
    });
    
    // Update user's points if the task has a reward
    if (updatedTask.reward && updatedTask.reward > 0) {
      try {
        // Get current points
        const { data: userData, error: userError } = await supabaseAdmin
          .from('users')
          .select('points')
          .eq('id', userId)
          .single();
          
        if (userError) throw userError;
        
        const currentPoints = userData?.points || 0;
        const newPoints = currentPoints + updatedTask.reward;
        
        // Update points
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({ points: newPoints })
          .eq('id', userId);
          
        if (updateError) throw updateError;
        
        return apiResponse({
          success: true,
          message: 'Task completed successfully',
          task: updatedTask,
          pointsAwarded: updatedTask.reward,
          newPoints
        });
      } catch (pointsError) {
        console.error('Error updating user points:', pointsError);
        // Continue with the response even if points update fails
      }
    }
    
    return apiResponse({
      success: true,
      message: 'Task completed successfully',
      task: updatedTask
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Error in task completion:', {
      error: errorMessage,
      stack: errorStack
    });
    
    return apiError(
      'Failed to complete task',
      500,
      errorMessage
    );
  }
} 