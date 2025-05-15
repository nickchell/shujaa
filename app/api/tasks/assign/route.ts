import { createAdminClient } from '@/lib/supabase/server';
import { apiResponse, apiError } from '@/lib/api-utils';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return apiError('User ID is required', 400);
    }

    // Create a Supabase admin client
    const supabaseAdmin = await createAdminClient();
    
    if (!supabaseAdmin) {
      return apiError('Failed to initialize Supabase admin client', 500);
    }

    // First verify the user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return apiError('User not found', 404);
    }

    // Get all active task templates with required fields
    const { data: templates, error: templatesError } = await supabaseAdmin
      .from('task_templates')
      .select('id, title, description, task_type, link, reward, is_active, expires_at')
      .eq('is_active', true);
      
    console.log('Active task templates:', JSON.stringify(templates, null, 2));

    if (templatesError) {
      return apiError('Failed to fetch task templates', 500, templatesError.message);
    }

    if (!templates || templates.length === 0) {
      return apiResponse({ message: 'No active task templates found' });
    }

    // Check if user already has any tasks
    const { data: existingTasks, error: existingTasksError, count } = await supabaseAdmin
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (existingTasksError) {
      return apiError('Failed to check existing tasks', 500, existingTasksError.message);
    }

    // If user already has tasks, return them without assigning new ones
    if (count && count > 0) {
      const { data: userTasks } = await supabaseAdmin
        .from('tasks')
        .select('*')
        .eq('user_id', userId);
        
      return apiResponse({
        message: 'User already has tasks assigned',
        tasks: userTasks || []
      });
    }

    // If we get here, user has no tasks, so we'll assign all active templates
    const newTemplates = [...templates];
    console.log('Assigning initial tasks to new user. Templates to assign:', newTemplates.map(t => t.task_type));

    // Create and insert tasks one by one to handle potential race conditions
    const insertedTasks: any[] = [];
    
    for (const template of newTemplates) {
      // Calculate expiration date (7 days from now if not specified in template)
      const expiresAt = template.expires_at 
        ? new Date(template.expires_at).toISOString()
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const task = {
        user_id: userId,
        title: template.title || 'Untitled Task',
        description: template.description || null,  // matches table structure (nullable)
        task_type: template.task_type,  // required in schema
        link: template.link || null,    // matches table structure (nullable)
        reward: template.reward || 0,   // required in schema, default to 0
        is_completed: false,            // default from schema
        created_at: new Date().toISOString(),
        expires_at: expiresAt
      };
      
      console.log('Attempting to create task:', JSON.stringify(task, null, 2));
      
      try {
        // Insert the task - we've already checked for duplicates by task_type
        const { data: insertedTask, error: insertError } = await supabaseAdmin
          .from('tasks')
          .insert(task)
          .select()
          .single();
          
        if (insertError) {
          console.error('Error inserting task:', {
            task,
            error: insertError
          });
          // Skip this task but continue with others
          continue;
        }
        
        insertedTasks.push(insertedTask);
      } catch (err) {
        console.error('Exception while inserting task:', {
          task,
          error: err
        });
        // Skip this task but continue with others
        continue;
      }
    }

    // Fetch all tasks for the user again to ensure we have the latest data
    const { data: updatedTasks, error: fetchError } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('user_id', userId);

    if (fetchError) {
      console.error('Error fetching updated tasks:', fetchError);
      return apiError('Failed to fetch updated tasks', 500, fetchError.message);
    }

    return apiResponse({
      tasks: updatedTasks || [],
      message: `Assigned ${insertedTasks.length} initial tasks to new user`
    });
  } catch (error) {
    console.error('Error assigning tasks:', error);
    return apiError(
      'Failed to assign tasks', 
      500, 
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
} 