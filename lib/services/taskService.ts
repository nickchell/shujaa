import { createClient } from '@/lib/supabase/server';
import { Task, TaskTemplate } from '@/lib/types/task';

export async function getUserTasks(userId: string): Promise<Task[]> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error loading tasks: ${error.message}`);
    }

    // If no tasks found, try to assign new ones
    if (!data || data.length === 0) {
      const newTasks = await assignTasksToUser(userId);
      return newTasks;
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export async function markTaskComplete(taskId: string, userId: string): Promise<Task> {
  if (!taskId) {
    throw new Error('Task ID is required');
  }

  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const response = await fetch('/api/tasks/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taskId, userId }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error || `Failed to complete task (${response.status})`;
      throw new Error(errorMessage);
    }

    if (!data.task) {
      const errorMessage = 'No task data returned from API';
      throw new Error(errorMessage);
    }

    return data.task;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Unknown error occurred');
  }
}

export async function createTaskFromTemplate(
  userId: string,
  templateId: string
): Promise<Task> {
  const supabase = createClient();
  
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
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('task_templates')
      .select('*')
      .eq('is_active', true);

    if (error) {
      throw new Error(`Failed to fetch task templates: ${error.message}`);
    }

    return data || [];
  } catch (err) {
    throw err;
  }
}

export async function assignTasksToUser(userId: string): Promise<Task[]> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const response = await fetch('/api/tasks/assign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to assign tasks');
    }

    const data = await response.json();
    return data.tasks || [];
  } catch (error) {
    throw error;
  }
}

export async function assignNewTasksToAllUsers(): Promise<void> {
  try {
    const supabase = createClient();
    
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
    throw error;
  }
}

export async function getUserAvailableTasks(userId: string): Promise<Task[]> {
  const supabase = createClient();
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