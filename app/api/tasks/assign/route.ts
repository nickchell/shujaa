import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
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

    // First verify the user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all active task templates
    const { data: templates, error: templatesError } = await supabaseAdmin
      .from('task_templates')
      .select('*')
      .eq('is_active', true);

    if (templatesError) {
      return NextResponse.json(
        { error: 'Failed to fetch task templates' },
        { status: 500 }
      );
    }

    if (!templates || templates.length === 0) {
      return NextResponse.json(
        { message: 'No active task templates found' },
        { status: 200 }
      );
    }

    // Get existing tasks for the user
    const { data: existingTasks, error: existingTasksError } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('user_id', userId);

    if (existingTasksError) {
      return NextResponse.json(
        { error: 'Failed to fetch existing tasks' },
        { status: 500 }
      );
    }

    // Filter out templates that already have tasks for this user
    const existingTaskTitles = new Set(existingTasks?.map(task => task.title) || []);
    const newTemplates = templates.filter(template => !existingTaskTitles.has(template.title));

    if (newTemplates.length === 0) {
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

    // Insert tasks
    const { data: insertedTasks, error: insertError } = await supabaseAdmin
      .from('tasks')
      .insert(newTasks)
      .select();

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to insert tasks' },
        { status: 500 }
      );
    }

    // Return all tasks for the user
    const { data: allTasks, error: fetchError } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch all tasks' },
        { status: 500 }
      );
    }

    return NextResponse.json({ tasks: allTasks });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 