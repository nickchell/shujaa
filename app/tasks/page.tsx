'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Task } from '@/lib/types/task';
import { getUserTasks, markTaskComplete, assignTasksToUser } from '@/lib/services/taskService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function TasksPage() {
  const { user, isLoaded } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTasks() {
      if (!isLoaded) return;
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        console.log('Loading tasks for user:', user.id);
        // First try to assign tasks if user doesn't have any
        const userTasks = await getUserTasks(user.id);
        console.log('Current user tasks:', userTasks);

        if (userTasks.length === 0) {
          console.log('No tasks found, assigning new tasks...');
          const newTasks = await assignTasksToUser(user.id);
          console.log('Newly assigned tasks:', newTasks);
          setTasks(newTasks);
        } else {
          setTasks(userTasks);
        }
      } catch (err) {
        console.error('Error loading tasks:', err);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, [user?.id, isLoaded]);

  const handleTaskComplete = async (taskId: string) => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    try {
      const updatedTask = await markTaskComplete(taskId, user.id);
      setTasks(tasks.map(task => 
        task.id === taskId ? updatedTask : task
      ));
    } catch (err) {
      console.error('Error completing task:', err);
      setError('Failed to mark task as complete. Please try again.');
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Please sign in to view your tasks.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Your Tasks</h1>
      
      {tasks.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-500 mb-4">No tasks available at the moment.</p>
          <Button 
            onClick={() => assignTasksToUser(user.id).then(newTasks => setTasks(newTasks))}
            className="mt-4"
          >
            Refresh Tasks
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <Card key={task.id} className={task.is_completed ? 'opacity-75' : ''}>
              <CardHeader>
                <CardTitle>{task.title}</CardTitle>
                <CardDescription>{task.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Reward: KSh {task.reward}
                </p>
                {task.link && (
                  <a 
                    href={task.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline text-sm"
                  >
                    View Task
                  </a>
                )}
              </CardContent>
              <CardFooter>
                {!task.is_completed && (
                  <Button
                    onClick={() => handleTaskComplete(task.id)}
                    className="w-full"
                  >
                    Mark Complete
                  </Button>
                )}
                {task.is_completed && (
                  <p className="text-green-500 w-full text-center">
                    Completed ✓
                  </p>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 