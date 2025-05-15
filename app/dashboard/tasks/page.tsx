"use client";

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Check, Tv, Send, Globe, AlertCircle, Loader2, RefreshCw, Gift } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Task } from '@/lib/types/task';
import { useTasks } from '@/lib/contexts/TaskContext';

export default function TasksPage() {
  const { isLoaded } = useUser();
  const { toast } = useToast();
  const { 
    tasks, 
    loading, 
    error, 
    refreshTasks, 
    markTaskComplete, 
    loadMoreTasks, 
    hasMoreTasks 
  } = useTasks();
  const [isAssigning, setIsAssigning] = useState(false);

  const handleLoadMore = async () => {
    if (isAssigning) return;
    
    try {
      setIsAssigning(true);
      console.log('Loading more tasks...');
      await loadMoreTasks();
      toast({
        title: "Tasks Updated",
        description: "Your tasks have been updated.",
      });
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load more tasks';
      console.error('Error loading more tasks:', errorMessage);
      toast({
        title: "Error Loading Tasks",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshTasks();
      toast({
        title: "Tasks Refreshed",
        description: "Your tasks have been refreshed.",
      });
    } catch (err: any) {
      console.error('Error refreshing tasks:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to refresh tasks. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      console.log('Marking task as complete:', taskId);
      await markTaskComplete(taskId);
      
      toast({
        title: "Success",
        description: "Task marked as complete!",
      });
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to mark task as complete',
        variant: "destructive",
      });
      throw error;
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-red-500">{error}</p>
        <Button onClick={handleRefresh} variant="outline" disabled={loading}>
          {loading ? 'Loading...' : 'Try Again'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Tasks</h1>
        <div className="flex space-x-2">
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm" 
            disabled={loading}
            className="mr-2"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
          <Button 
            onClick={handleLoadMore} 
            variant="outline" 
            size="sm" 
            disabled={isAssigning || !hasMoreTasks}
          >
            {isAssigning ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Load More Tasks
          </Button>
        </div>
      </div>

      {totalTasks > 0 && (
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span>Level Progress</span>
            <span>{Math.round((completedTasks / totalTasks) * 100)}%</span>
          </div>
          <Progress value={(completedTasks / totalTasks) * 100} className="h-2" />
        </div>
      )}

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {tasks.length === 0 ? (
              <div className="col-span-2 text-center py-8">
                <p className="text-muted-foreground mb-4">No tasks available.</p>
                <Button onClick={refreshTasks}>
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
