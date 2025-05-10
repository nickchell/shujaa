import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { taskId, userId } = await request.json();
    console.log('Task completion request received:', { taskId, userId });
    
    if (!taskId || !userId) {
      const error = 'Missing required fields';
      console.error(error, { taskId, userId });
      return NextResponse.json(
        { error },
        { status: 400 }
      );
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

    if (fetchError) {
      const error = `Error fetching task: ${fetchError.message}`;
      console.error(error, {
        code: fetchError.code,
        message: fetchError.message,
        details: fetchError.details,
        hint: fetchError.hint,
        taskId,
        userId
      });
      return NextResponse.json(
        { error },
        { status: 500 }
      );
    }

    if (!existingTask) {
      const error = `Task not found or does not belong to user`;
      console.error(error, { taskId, userId });
      return NextResponse.json(
        { error },
        { status: 404 }
      );
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

    if (updateError) {
      const error = `Error updating task: ${updateError.message}`;
      console.error(error, {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        taskId,
        userId
      });
      return NextResponse.json(
        { error },
        { status: 500 }
      );
    }

    if (!updatedTask) {
      const error = 'No task returned after update';
      console.error(error, { taskId, userId });
      return NextResponse.json(
        { error },
        { status: 500 }
      );
    }

    console.log('Task updated successfully:', {
      id: updatedTask.id,
      title: updatedTask.title,
      userId: updatedTask.user_id,
      isCompleted: updatedTask.is_completed
    });
    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error in task completion:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 