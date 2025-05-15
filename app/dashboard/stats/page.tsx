'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Gift, Trophy, ClipboardList, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useTasks } from '@/lib/contexts/TaskContext';
import { Task, TaskStatus } from '@/lib/types/task';

export default function StatsPage() {
  const { isLoaded, user } = useUser();
  const { 
    tasks, 
    loading, 
    error, 
    refreshTasks, 
    hasMoreTasks 
  } = useTasks();

  // Debug logs
  useEffect(() => {
    console.log('StatsPage - User:', user?.id);
    console.log('StatsPage - Tasks:', tasks);
    console.log('StatsPage - Loading:', loading);
    console.log('StatsPage - Error:', error);
  }, [user, tasks, loading, error]);

  // Helper functions
  const getActivityIcon = (isCompleted: boolean) => {
    return isCompleted 
      ? <CheckCircle className="h-5 w-5 text-green-500" />
      : <ClipboardList className="h-5 w-5 text-gray-500" />;
  };
  
  const getActivityStatus = (isCompleted: boolean) => {
    return isCompleted ? 'Completed' : 'In Progress';
  };
  
  const getActivityStatusClass = (isCompleted: boolean) => {
    return isCompleted 
      ? 'bg-green-100 text-green-600' 
      : 'bg-yellow-100 text-yellow-600';
  };

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.is_completed).length;
  const pendingTasks = tasks.filter((task) => !task.is_completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalRewards = tasks.reduce(
    (sum: number, task: { is_completed: boolean; reward: number }) => 
      sum + (task.is_completed ? task.reward : 0), 
    0
  );
  
  // Get latest 3 activities
  const latestActivities = [...tasks]
    .sort((a, b) => {
      const dateA = new Date(b.updated_at || b.created_at || 0).getTime();
      const dateB = new Date(a.updated_at || a.created_at || 0).getTime();
      return dateA - dateB;
    })
    .slice(0, 3);

  if (!isLoaded) {
    console.log('StatsPage - User not loaded');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (loading) {
    console.log('StatsPage - Tasks loading...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-red-500">{error}</p>
        <Button onClick={refreshTasks} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to view your stats</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Dashboard</h1>
        <Button onClick={refreshTasks} disabled={loading}>
          {loading ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">{completedTasks} completed, {pendingTasks} pending</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">Task completion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Progress</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">Tasks completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rewards Earned</CardTitle>
            <Gift className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRewards}MB</div>
            <p className="text-xs text-muted-foreground">Data rewards earned</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest Activity</CardTitle>
          <CardDescription>Your recent task progress</CardDescription>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent activity. Complete some tasks to see your progress here.
            </div>
          ) : (
            <div className="space-y-4">
              {latestActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getActivityStatusClass(activity.is_completed)}`}>
                      {getActivityIcon(activity.is_completed)}
                    </div>
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-gray-500">
                        {getActivityStatus(activity.is_completed)} • {new Date(activity.updated_at || activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">+{activity.reward} MB</span>
                    <Gift className="h-4 w-4 text-yellow-500" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
