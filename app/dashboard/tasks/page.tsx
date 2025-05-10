"use client";

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Check, Gift, Tv, Send, Globe, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Task } from '@/lib/types/task';
import { getUserTasks, markTaskComplete, assignTasksToUser } from '@/lib/services/taskService';

export default function TasksPage() {
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
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
        console.log('Loading tasks for user:', {
          userId: user.id,
          isLoaded,
          userExists: !!user
        });

        const userTasks = await getUserTasks(user.id);
        console.log('Fetched tasks from database:', {
          taskCount: userTasks.length,
          tasks: userTasks.map(t => ({ id: t.id, title: t.title, is_completed: t.is_completed }))
        });

        if (userTasks.length === 0) {
          console.log('No tasks found, assigning new tasks...');
          const newTasks = await assignTasksToUser(user.id);
          console.log('Newly assigned tasks:', {
            taskCount: newTasks.length,
            tasks: newTasks.map(t => ({ id: t.id, title: t.title, is_completed: t.is_completed }))
          });
          setTasks(newTasks);
        } else {
          setTasks(userTasks);
        }
      } catch (err: any) {
        console.error('Error loading tasks:', {
          error: err instanceof Error ? err.message : 'Unknown error',
          userId: user.id,
          stack: err instanceof Error ? err.stack : undefined
        });
        setError(err.message || 'Failed to load tasks. Please try again later.');
        toast({
          title: "Error Loading Tasks",
          description: err.message || "There was a problem loading your tasks.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, [user?.id, isLoaded, toast]);

  const handleTaskComplete = async (taskId: string) => {
    try {
      console.log('Attempting to complete task:', {
        taskId,
        userId: user?.id,
        currentTasks: tasks.map(t => ({ id: t.id, title: t.title, is_completed: t.is_completed }))
      });

      if (!user?.id) {
        const error = 'User must be logged in to complete tasks';
        console.error(error);
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }

      // Find the task in our local state
      const taskToComplete = tasks.find(task => task.id === taskId);
      console.log('Task to complete:', taskToComplete ? {
        id: taskToComplete.id,
        title: taskToComplete.title,
        userId: taskToComplete.user_id,
        isCompleted: taskToComplete.is_completed
      } : null);

      if (!taskToComplete) {
        const error = `Task with ID ${taskId} not found in local state`;
        console.error(error, {
          taskId,
          availableTaskIds: tasks.map(t => ({ id: t.id, title: t.title }))
        });
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }

      try {
        console.log('Calling markTaskComplete...');
        const updatedTask = await markTaskComplete(taskId, user.id);
        console.log('Task completed successfully:', {
          id: updatedTask.id,
          title: updatedTask.title,
          userId: updatedTask.user_id,
          isCompleted: updatedTask.is_completed
        });
        
        // Update local state
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId ? { ...task, is_completed: true } : task
          )
        );

        toast({
          title: "Success",
          description: "Task marked as complete!",
        });
      } catch (taskError) {
        const errorMessage = taskError instanceof Error ? taskError.message : 'Unknown error';
        console.error('Error completing task:', {
          error: errorMessage,
          taskId,
          userId: user.id,
          taskToComplete,
          stack: taskError instanceof Error ? taskError.stack : undefined
        });
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error in handleTaskComplete:', {
        error: errorMessage,
        taskId,
        userId: user?.id,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleRefreshTasks = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const newTasks = await assignTasksToUser(user.id);
      setTasks(newTasks);
      toast({
        title: "Tasks Refreshed",
        description: "New tasks have been assigned to you.",
      });
    } catch (err: any) {
      console.error('Error refreshing tasks:', err);
      setError(err.message || 'Failed to refresh tasks. Please try again later.');
      toast({
        title: "Error",
        description: err.message || "Failed to refresh tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTaskIcon = (taskType: string) => {
    switch (taskType) {
      case 'install_app':
        return Globe;
      case 'signup_offer':
        return Send;
      case 'watch_video':
        return Tv;
      default:
        return Gift;
    }
  };

  const completedTasks = tasks.filter(task => task.is_completed).length;
  const totalTasks = tasks.length;

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
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
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-red-500">{error}</p>
        <Button onClick={handleRefreshTasks} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground">
            Complete tasks to earn rewards and level up.
          </p>
        </div>
        <Button onClick={handleRefreshTasks} variant="outline">
          Refresh Tasks
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-semibold">Your Progress</h3>
          <p className="text-sm text-muted-foreground">
            {completedTasks} of {totalTasks} tasks completed
          </p>
        </div>
        <div className="bg-muted p-2 rounded-lg text-center">
          <p className="text-sm font-medium">Level 1</p>
          <p className="text-xs text-muted-foreground">Complete more tasks to level up</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Level Progress</span>
          <span>{Math.round((completedTasks / totalTasks) * 100)}%</span>
        </div>
        <Progress value={(completedTasks / totalTasks) * 100} className="h-2" />
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {tasks.length === 0 ? (
              <div className="col-span-2 text-center py-8">
                <p className="text-muted-foreground mb-4">No tasks available.</p>
                <Button onClick={handleRefreshTasks}>
                  Get New Tasks
                </Button>
              </div>
            ) : (
              tasks.map((task) => (
                <Card key={task.id} className={task.is_completed ? 'bg-muted/30' : ''}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-full ${
                        task.is_completed ? 'bg-primary/10' : 'bg-secondary/10'
                      }`}>
                        {React.createElement(getTaskIcon(task.task_type), {
                          className: `h-4 w-4 ${
                            task.is_completed ? 'text-primary' : 'text-secondary'
                          }`
                        })}
                      </div>
                      <div>
                        <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
                        <CardDescription>{task.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={task.is_completed ? 'outline' : 'default'}>
                      KSh {task.reward}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    {task.link && (
                      <a 
                        href={task.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline"
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
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {tasks.filter(task => !task.is_completed).map((task) => (
              <Card key={task.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-full bg-secondary/10">
                      {React.createElement(getTaskIcon(task.task_type), {
                        className: "h-4 w-4 text-secondary"
                      })}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
                      <CardDescription>{task.description}</CardDescription>
                    </div>
                  </div>
                  <Badge>KSh {task.reward}</Badge>
                </CardHeader>
                <CardContent>
                  {task.link && (
                    <a 
                      href={task.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      View Task
                    </a>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleTaskComplete(task.id)}
                    className="w-full"
                  >
                    Mark Complete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {tasks.filter(task => task.is_completed).map((task) => (
              <Card key={task.id} className="bg-muted/30">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-full bg-primary/10">
                      {React.createElement(getTaskIcon(task.task_type), {
                        className: "h-4 w-4 text-primary"
                      })}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
                      <CardDescription>{task.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline">KSh {task.reward}</Badge>
                </CardHeader>
                <CardContent>
                  {task.link && (
                    <a 
                      href={task.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      View Task
                    </a>
                  )}
                </CardContent>
                <CardFooter>
                  <p className="text-green-500 w-full text-center">
                    Completed ✓
                  </p>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
