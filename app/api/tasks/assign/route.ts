import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    console.log('Task assignment request received:', { userId });
    
    if (!userId) {
      console.error('No user ID provided in request');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Create a Supabase client with the service role
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // First, get all active task templates
    console.log('Fetching active task templates...');
    const { data: templates, error: templatesError } = await supabaseAdmin
      .from('task_templates')
      .select('*')
      .eq('is_active', true);

    if (templatesError) {
      console.error('Error fetching templates:', {
        error: templatesError,
        code: templatesError.code,
        message: templatesError.message
      });
      return NextResponse.json(
        { error: 'Failed to fetch task templates' },
        { status: 500 }
      );
    }

    if (!templates || templates.length === 0) {
      console.log('No active task templates found');
      return NextResponse.json(
        { message: 'No active task templates found' },
        { status: 200 }
      );
    }

    console.log('Found templates:', templates);

    // Get existing tasks for the user
    console.log('Fetching existing tasks for user:', userId);
    const { data: existingTasks, error: existingTasksError } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('user_id', userId);

    if (existingTasksError) {
      console.error('Error fetching existing tasks:', {
        error: existingTasksError,
        code: existingTasksError.code,
        message: existingTasksError.message
      });
      return NextResponse.json(
        { error: 'Failed to fetch existing tasks' },
        { status: 500 }
      );
    }

    console.log('Existing tasks:', existingTasks);

    // Filter out templates that already have tasks for this user
    const existingTaskTitles = new Set(existingTasks?.map(task => task.title) || []);
    const newTemplates = templates.filter(template => !existingTaskTitles.has(template.title));

    console.log('New templates to create:', newTemplates);

    if (newTemplates.length === 0) {
      console.log('No new tasks to assign');
      return NextResponse.json(
        { message: 'No new tasks to assign', tasks: existingTasks },
        { status: 200 }
      );
    }

    // Create new tasks from remaining templates
    const newTasks = newTemplates.map(template => ({
      user_id: userId,
      title: template.title,
      description: template.description || '',
      task_type: template.task_type || 'general',
      link: template.link || null,
      reward: template.reward || 0,
      is_completed: false,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }));

    console.log('Creating new tasks:', newTasks);

    // Insert tasks
    const { data: insertedTasks, error: insertError } = await supabaseAdmin
      .from('tasks')
      .insert(newTasks)
      .select();

    if (insertError) {
      console.error('Error inserting tasks:', {
        error: insertError,
        code: insertError.code,
        message: insertError.message
      });
      return NextResponse.json(
        { error: 'Failed to insert tasks' },
        { status: 500 }
      );
    }

    console.log('Successfully inserted tasks:', insertedTasks);

    // Return all tasks for the user
    const { data: allTasks, error: fetchError } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching all tasks:', {
        error: fetchError,
        code: fetchError.code,
        message: fetchError.message
      });
      return NextResponse.json(
        { error: 'Failed to fetch all tasks' },
        { status: 500 }
      );
    }

    console.log('Returning all tasks for user:', allTasks);
    return NextResponse.json({ tasks: allTasks });
  } catch (error) {
    console.error('Error in task assignment:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 