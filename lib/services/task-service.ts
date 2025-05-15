import { Task } from '@/lib/types/task';

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || '';

export interface TasksResponse {
  tasks: Task[];
  meta: {
    total: number;
    hasMore: boolean;
  };
}

export async function fetchUserTasks(userId: string): Promise<TasksResponse> {
  try {
    console.log(`Fetching tasks for user: ${userId}`);
    
    const response = await fetch(`${API_BASE_URL}/api/tasks?userId=${encodeURIComponent(userId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Prevent caching to get fresh data
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error response from API:', { status: response.status, errorData });
      throw new Error(errorData.error || 'Failed to fetch tasks');
    }

    const data: TasksResponse = await response.json();
    console.log(`Fetched ${data.tasks.length} tasks for user ${userId}`);
    return data;
  } catch (error) {
    console.error('Error in fetchUserTasks:', error);
    throw error;
  }
}

export async function updateTaskStatus(taskId: string, status: string, userId: string): Promise<boolean> {
  try {
    console.log(`Marking task ${taskId} as complete for user ${userId}`);
    
    if (!taskId || !userId) {
      console.error('Missing required parameters:', { taskId, userId });
      return false;
    }
    
    const url = `${API_BASE_URL}/api/tasks/complete`;
    console.log('Making POST request to:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        taskId,
        userId,
      }),
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      console.error('Failed to parse JSON response:', responseText);
      return false;
    }

    if (!response.ok) {
      console.error('Error completing task:', {
        status: response.status,
        statusText: response.statusText,
        response: responseData,
      });
      return false;
    }

    console.log(`Successfully marked task ${taskId} as complete`, responseData);
    return responseData.success === true;
  } catch (error) {
    console.error('Error in updateTaskStatus:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}
