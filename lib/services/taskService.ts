import { supabase } from '@/lib/supabase';
import { config } from '@/lib/config';
import { Task, TaskTemplate } from '@/lib/types/task';

export const getUserTasks = async (userId: string): Promise<Task[]> => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  console.log('Fetching tasks for user:', userId);
  
  if (!supabase) {
    console.error('Failed to initialize Supabase client');
    throw new Error('Failed to initialize Supabase client');
  }

  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }

    if (!tasks || tasks.length === 0) {
      console.log('No tasks found for user:', userId);
      return [];
    }

    console.log(`Found ${tasks.length} tasks for user:`, userId);
    return tasks as unknown as Task[];
  } catch (error) {
    console.error('Error in getUserTasks:', error);
    throw error;
  }
}

export const markTaskComplete = async (taskId: string, userId: string): Promise<Task> => {
  if (!taskId) {
    throw new Error('Task ID is required');
  }
  
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    console.log('Marking task as complete via API:', { taskId, userId });
    
    const response = await fetch('/api/tasks/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({ taskId, userId }),
    });

    if (!response.ok) {
      let errorMessage = `Server error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        console.error('Error response from task completion API:', { 
          status: response.status,
          error: errorMessage
        });
      } catch (e) {
        console.error('Failed to parse error response:', e);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (!data.success) {
      const errorMessage = data.message || 'Task completion was not successful';
      console.error('Task completion failed:', errorMessage);
      throw new Error(errorMessage);
    }
    
    if (!data.task) {
      throw new Error('No task data returned from API');
    }
    
    console.log('Task successfully marked as complete:', data.task);
    return data.task as Task;
  } catch (error) {
    console.error('Exception in markTaskComplete:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

export const createTaskFromTemplate = async (template: TaskTemplate, userId: string): Promise<Task> => {
  try {
    // First get the template
    const { data: templateData, error: templateError } = await supabase
      .from('task_templates')
      .select('*')
      .eq('id', template.id)
      .single();

    if (templateError) {
      console.error('Error fetching template:', templateError);
      throw templateError;
    }

    if (!templateData) {
      throw new Error(`Template with id ${template.id} not found`);
    }

    // Create the task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        title: templateData.title,
        description: templateData.description,
        link: templateData.link,
        reward: templateData.reward,
        task_type: 'signup_offer', // Default type, adjust as needed
      })
      .select()
      .single();

    if (taskError) {
      console.error('Error creating task from template:', taskError);
      throw taskError;
    }

    if (!task) {
      throw new Error('Task was created but no data was returned');
    }

    return task as unknown as Task;
  } catch (error) {
    console.error('Exception in createTaskFromTemplate:', error);
    throw error;
  }
}

export const getTaskTemplates = async (): Promise<TaskTemplate[]> => {
  try {
    const { data, error } = await supabase
      .from('task_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching task templates:', error);
      throw new Error(`Failed to fetch task templates: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    return data as unknown as TaskTemplate[];
  } catch (error) {
    console.error('Error in getTaskTemplates:', error);
    throw error;
  }
}

export const assignTasksToUser = async (userId: string): Promise<Task[]> => {
  if (!userId) {
    console.error('User ID is required for task assignment');
    throw new Error('User ID is required');
  }

  console.log('Assigning tasks to user:', userId);
  
  // First, check if the user exists in our database
  if (!supabase) {
    const errorMessage = 'Failed to initialize Supabase client';
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  try {
    console.log('Checking if user exists in database:', userId);
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      const errorMessage = `User not found in database: ${userId}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    console.log('User found, assigning tasks via API endpoint');
    
    // Use absolute URL for API endpoint to avoid relative path issues
    const apiUrl = new URL('/api/tasks/assign', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').toString();
    
    console.log('Calling API endpoint:', apiUrl);
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      let errorMessage = `Failed to assign tasks: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        console.error('Failed to parse error response:', e);
      }
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const assignedTasks = data.tasks as Task[] || [];
    
    console.log(`Successfully assigned ${assignedTasks.length} tasks to user ${userId}`);
    return assignedTasks;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during task assignment';
    console.error('Error in assignTasksToUser:', errorMessage, error);
    throw new Error(`Failed to assign tasks: ${errorMessage}`);
  }
}

export const assignNewTasksToAllUsers = async (): Promise<{ [key: string]: Task[] }> => {
  try {
    // Get all active users with proper typing
    type UserRow = { id: string };
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .returns<UserRow[]>();

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    if (!users || users.length === 0) {
      console.log('No users found');
      return {};
    }

    // Get active task templates
    const templates = await getTaskTemplates();
    
    // For each user, create tasks from templates
    const result: { [key: string]: Task[] } = {};
    for (const user of users) {
      const userTasks: Task[] = [];
      for (const template of templates) {
        try {
          // Check if user already has this task
          const { data: existingTask, error: checkError } = await supabase
            .from('tasks')
            .select('id')
            .eq('user_id', user.id)
            .eq('title', template.title)
            .single();

          if (checkError && checkError.code !== 'PGRST116') {
            console.error('Error checking existing task:', checkError);
            continue;
          }

          // Only create task if user doesn't have it
          if (!existingTask) {
            const { error: insertError } = await supabase
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
              
            if (insertError) {
              console.error('Error inserting task:', insertError);
            } else {
              userTasks.push({
                id: '',
                user_id: user.id,
                title: template.title,
                description: template.description,
                link: template.link,
                reward: template.reward,
                task_type: 'signup_offer',
                created_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
              } as Task);
            }
          }
        } catch (taskError) {
          console.error('Error processing task for user:', { userId: user.id, error: taskError });
          // Continue with next task
        }
      }
      result[user.id] = userTasks;
    }
    return result;
  } catch (error) {
    console.error('Exception in assignNewTasksToAllUsers:', error);
    throw error;
  }
}

export const getUserAvailableTasks = async (userId: string): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', false)
      .lt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching available tasks:', error);
      throw error;
    }

    return (data || []) as unknown as Task[];
  } catch (error) {
    console.error('Exception in getUserAvailableTasks:', error);
    throw error;
  }
} 