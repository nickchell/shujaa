import { supabase } from '@/lib/supabase';
import { Task, TaskTemplate } from '@/lib/types/task';

export async function getUserTasks(userId: string): Promise<Task[]> {
  console.log('Fetching tasks for user:', userId);
  
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    console.log('Querying tasks from database...');
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        userId
      });
      throw new Error(`Error loading tasks: ${error.message}`);
    }

    console.log('Fetched tasks from database:', data);

    // If no tasks found, try to assign new ones
    if (!data || data.length === 0) {
      console.log('No tasks found, attempting to assign new tasks...');
      const newTasks = await assignTasksToUser(userId);
      console.log('Newly assigned tasks:', newTasks);
      return newTasks;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserTasks:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

export async function markTaskComplete(taskId: string, userId: string): Promise<Task> {
  console.log('Marking task as complete:', { taskId, userId });
  
  if (!taskId) {
    throw new Error('Task ID is required');
  }

  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    console.log('Calling task completion API...');
    const response = await fetch('/api/tasks/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taskId, userId }),
    });

    const data = await response.json();
    console.log('Task completion API response:', data);

    if (!response.ok) {
      const errorMessage = data.error || `Failed to complete task (${response.status})`;
      console.error('Task completion API error:', {
        status: response.status,
        statusText: response.statusText,
        error: data.error,
        taskId,
        userId
      });
      throw new Error(errorMessage);
    }

    if (!data.task) {
      const errorMessage = 'No task data returned from API';
      console.error(errorMessage, { response: data });
      throw new Error(errorMessage);
    }

    return data.task;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error in markTaskComplete:', {
      error: errorMessage,
      taskId,
      userId,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error(errorMessage);
  }
}

export async function createTaskFromTemplate(
  userId: string,
  templateId: string
): Promise<Task> {
  // First get the template
  const { data: template, error: templateError } = await supabase
    .from('task_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (templateError) throw templateError;

  // Create the task
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      title: template.title,
      description: template.description,
      link: template.link,
      reward: template.reward,
      task_type: 'signup_offer', // Default type, adjust as needed
    })
    .select()
    .single();

  if (taskError) throw taskError;
  return task;
}

export async function getActiveTaskTemplates(): Promise<TaskTemplate[]> {
  console.log('Fetching active task templates');
  
  try {
    const { data, error } = await supabase
      .from('task_templates')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Supabase error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Failed to fetch task templates: ${error.message}`);
    }

    console.log('Fetched task templates:', data);
    return data || [];
  } catch (err) {
    console.error('Error in getActiveTaskTemplates:', err);
    throw err;
  }
}

export async function assignTasksToUser(userId: string): Promise<Task[]> {
  console.log('Assigning tasks to user:', userId);
  
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    console.log('Calling task assignment API...');
    const response = await fetch('/api/tasks/assign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Task assignment API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(errorData.error || 'Failed to assign tasks');
    }

    const data = await response.json();
    console.log('Task assignment API response:', data);
    return data.tasks || [];
  } catch (error) {
    console.error('Error in assignTasksToUser:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

export async function assignNewTasksToAllUsers(): Promise<void> {
  try {
    // Get all active users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id');

    if (usersError) throw usersError;

    // Get active task templates
    const templates = await getActiveTaskTemplates();

    // For each user, create tasks from templates
    for (const user of users) {
      for (const template of templates) {
        // Check if user already has this task
        const { data: existingTask } = await supabase
          .from('tasks')
          .select('id')
          .eq('user_id', user.id)
          .eq('title', template.title)
          .single();

        // Only create task if user doesn't have it
        if (!existingTask) {
          await supabase
            .from('tasks')
            .insert({
              user_id: user.id,
              title: template.title,
              description: template.description,
              link: template.link,
              reward: template.reward,
              task_type: 'signup_offer',
              created_at: new Date().toISOString(),
              expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            });
        }
      }
    }
  } catch (error) {
    console.error('Error assigning new tasks to all users:', error);
    throw error;
  }
}

export async function getUserAvailableTasks(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('is_completed', false)
    .lt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
} 