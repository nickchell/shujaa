'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { Task, TaskStatus } from '@/lib/types/task';
import { fetchUserTasks, updateTaskStatus as updateTaskStatusApi } from '@/lib/services/task-service';
import { env } from '@/lib/env';

// Ensure TaskStatus is properly imported and available
const { PENDING, IN_PROGRESS, COMPLETED, FAILED } = TaskStatus;

type TaskContextType = {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  refreshTasks: () => Promise<void>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<boolean>;
  completeTask: (taskId: string) => Promise<boolean>;
  markTaskComplete: (taskId: string) => Promise<boolean>;
  fetchTaskById: (taskId: string) => Promise<Task | null>;
  loadMoreTasks: () => Promise<void>;
  hasMoreTasks: boolean;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreTasks, setHasMoreTasks] = useState(true);
  const userId = user?.id;

  // Check if task service is properly configured and available
  const isTaskServiceReady = useCallback((): boolean => {
    if (!env.app?.url) {
      const errorMsg = 'App URL is not properly configured. Check your environment variables.';
      console.error(errorMsg);
      setError('Service configuration error. Please try again later.');
      return false;
    }
    
    return true;
  }, []);

  // Initialize task service and verify authentication
  const initializeTaskService = useCallback(async (): Promise<boolean> => {
    if (!isLoaded) {
      const errorMsg = 'User authentication not loaded';
      console.error(errorMsg);
      setError(errorMsg);
      return false;
    }
    
    if (!userId) {
      const errorMsg = 'User not authenticated';
      console.error(errorMsg);
      setError(errorMsg);
      return false;
    }
    
    return true;
  }, [isLoaded, userId]);

  // Fetch tasks from the API
  const fetchTasks = useCallback(async () => {
    console.log('fetchTasks called with userId:', userId, 'isLoaded:', isLoaded);
    
    if (!userId || !isLoaded) {
      console.log('Skipping fetchTasks - userId:', userId, 'isLoaded:', isLoaded);
      setHasMoreTasks(false);
      return;
    }
    
    try {
      // Initialize task service which will verify user is loaded
      const isServiceInitialized = await initializeTaskService();
      if (!isServiceInitialized) {
        const errorMsg = 'Failed to initialize task service';
        console.error(errorMsg);
        setError(errorMsg);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      console.log('Fetching tasks for user:', userId);
      
      // Use the task service to fetch tasks
      const { tasks, meta } = await fetchUserTasks(userId);
      
      console.log('Fetched tasks:', { 
        count: tasks.length, 
        hasMore: meta.hasMore,
        total: meta.total
      });
      
      // Update state with the fetched tasks
      setTasks(tasks);
      setHasMoreTasks(meta.hasMore);
      setLoading(false);
    } catch (err) {
      console.error('Error in fetchTasks:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userId, isLoaded, initializeTaskService]);

  // Update task status via API
  const updateTaskStatus = useCallback(async (taskId: string, status: TaskStatus): Promise<boolean> => {
    if (!userId) {
      console.error('User ID is not available');
      return false;
    }

    try {
      console.log(`Updating task ${taskId} status to ${status}`);
      const success = await updateTaskStatusApi(taskId, status, userId);
      
      if (success) {
        // Update local state
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === taskId 
              ? { 
                  ...task, 
                  status: TaskStatus.COMPLETED,
                  is_completed: true,
                  updated_at: new Date().toISOString() 
                } 
              : task
          )
        );
      } else {
        console.error('Failed to update task status in the database');
      }

      return success;
    } catch (error) {
      console.error('Error updating task status:', error);
      return false;
    }
  }, [userId]);

  // Complete a task
  const completeTask = useCallback(async (taskId: string): Promise<boolean> => {
    return updateTaskStatus(taskId, TaskStatus.COMPLETED);
  }, [updateTaskStatus]);

  // Fetch a single task by ID
  const fetchTaskById = useCallback(async (taskId: string): Promise<Task | null> => {
    if (!userId || !isLoaded) {
      console.error('Cannot fetch task: User not authenticated or loaded');
      return null;
    }
    
    try {
      // Initialize task service which will also verify authentication
      const isServiceInitialized = await initializeTaskService();
      if (!isServiceInitialized) {
        const errorMsg = 'Failed to initialize task service';
        console.error(errorMsg);
        setError(errorMsg);
        return null;
      }
      
      // Fetch all tasks and find the one with matching ID
      const { tasks } = await fetchUserTasks(userId);
      const task = tasks.find(t => t.id === taskId) || null;
      
      return task;
    } catch (err) {
      console.error('Error fetching task:', err);
      setError('Failed to fetch task. Please try again.');
      return null;
    }
  }, [userId, isLoaded, initializeTaskService]);

  // Load more tasks (pagination implementation)
  const loadMoreTasks = useCallback(async () => {
    if (!userId || !isLoaded || loading) return;
    
    setLoading(true);
    try {
      // Since we're using fetchUserTasks which doesn't support pagination,
      // we'll just fetch all tasks and handle pagination client-side
      const { tasks: allTasks, meta } = await fetchUserTasks(userId);
      
      // Get the next batch of tasks
      const nextBatch = allTasks.slice(tasks.length, tasks.length + 10);
      
      if (nextBatch.length > 0) {
        setTasks(prev => [...prev, ...nextBatch]);
        setHasMoreTasks(allTasks.length > tasks.length + nextBatch.length);
      } else {
        setHasMoreTasks(false);
      }
    } catch (err) {
      console.error('Error loading more tasks:', err);
      setError('Failed to load more tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userId, isLoaded, tasks.length, loading]);

  // Function to assign tasks to a user
  const assignTasks = useCallback(async (userId: string): Promise<boolean> => {
    try {
      console.log('Attempting to assign tasks to user:', userId);
      const response = await fetch('/api/tasks/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to assign tasks:', errorData);
        return false;
      }

      const result = await response.json();
      console.log('Tasks assigned successfully:', result);
      return true;
    } catch (err) {
      console.error('Error assigning tasks:', err);
      return false;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    console.log('Initial fetch effect - isLoaded:', isLoaded, 'userId:', userId);
    
    const initializeAndFetchTasks = async () => {
      if (!isLoaded) {
        console.log('User not loaded yet');
        setLoading(false);
        return;
      }
      
      if (!userId) {
        console.log('No user ID available');
        setLoading(false);
        return;
      }
      
      console.log('Initializing task service and fetching tasks...');
      try {
        const initialized = await initializeTaskService();
        if (initialized) {
          console.log('Task service initialized, fetching tasks...');
          await fetchTasks();
          
          // If no tasks found, try to assign them
          if (tasks.length === 0) {
            console.log('No tasks found, attempting to assign initial tasks...');
            const assigned = await assignTasks(userId);
            if (assigned) {
              // If tasks were assigned, refresh the task list
              console.log('Tasks assigned, refreshing task list...');
              await fetchTasks();
            }
          }
          
          console.log('Initial task fetch completed');
        } else {
          console.error('Failed to initialize task service');
          setError('Failed to initialize task service');
        }
      } catch (err) {
        console.error('Error in initial task fetch:', err);
        setError('Failed to fetch tasks. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    initializeAndFetchTasks();
  }, [isLoaded, userId, fetchTasks, initializeTaskService, tasks.length, assignTasks]);
  
  // Debug effect to log task changes
  useEffect(() => {
    console.log('Tasks updated - count:', tasks.length);
    if (tasks.length > 0) {
      console.log('Sample task:', tasks[0]);
    }
  }, [tasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        refreshTasks: fetchTasks,
        updateTaskStatus,
        completeTask,
        markTaskComplete: completeTask, // Alias for backward compatibility
        fetchTaskById,
        loadMoreTasks,
        hasMoreTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export const useTasks = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
