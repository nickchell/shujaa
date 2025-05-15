'use client';

import { useEffect, useState } from 'react';
import { Task } from '@/lib/types/task';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcw, CheckCircle, Clock, Copy, Check, Gift, Activity, ClipboardList } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { PhoneInput } from './phone-input';
import { useUser } from '@clerk/nextjs';
import { format } from 'date-fns';
import { useTasks } from '@/lib/contexts/TaskContext';

interface DashboardClientProps {
  // No props needed since we're using useUser hook
}

// Add a named export of the same component
export function DashboardClient(props: DashboardClientProps) {
  return <DefaultDashboardClient {...props} />;
}

export default function DefaultDashboardClient(props: DashboardClientProps) {
  const [copied, setCopied] = useState(false);
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  
  // Use TaskContext for task management
  const { 
    tasks, 
    loading, 
    error, 
    refreshTasks 
  } = useTasks();

  // Show phone input if user doesn't have a phone number
  const showPhoneInput = !user?.phoneNumbers?.[0]?.phoneNumber;
  
  // Get referral code from user's public metadata or generate one
  const referralCode = user?.publicMetadata?.referralCode || 
                     (user?.id ? user.id.slice(0, 8).toUpperCase() : '');

  // Calculate task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.is_completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const totalRewards = tasks.reduce((sum, task) => sum + (task.is_completed ? task.reward : 0), 0);

  // Load tasks when component mounts or user changes
  useEffect(() => {
    if (!isLoaded) {
      console.log('User not loaded yet');
      return;
    }
    
    if (!user?.id) {
      console.log('No user ID available');
      return;
    }
    
    console.log('Loading tasks for user:', user.id);
    refreshTasks().catch(err => {
      console.error('Error refreshing tasks:', err);
      toast({
        title: 'Error',
        description: 'Failed to load tasks. Please try again later.',
        variant: 'destructive',
      });
    });
  }, [isLoaded, user?.id, refreshTasks, toast]);

  const copyReferralCode = async () => {
    if (!referralCode) return;

    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy referral code:', err);
      toast({
        title: 'Error',
        description: 'Failed to copy referral code',
        variant: 'destructive',
      });
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">All your tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">Tasks completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground">Tasks in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            <Gift className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRewards} MB</div>
            <p className="text-xs text-muted-foreground">Earned so far</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Task Progress</CardTitle>
            <CardDescription>Your overall task completion progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completion Rate</span>
                <span className="text-sm font-medium">{Math.round(completionRate)}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{completedTasks} completed</span>
                <span>{pendingTasks} remaining</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your most recent tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center">
                  <div className={`p-2 rounded-full ${
                    task.is_completed ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {task.is_completed ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.is_completed ? 'Completed' : 'In progress'} • {format(new Date(task.updated_at || task.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center">
                    <Gift className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="font-medium">+{task.reward} MB</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Referral Program</CardTitle>
            <CardDescription>Invite friends and earn rewards</CardDescription>
          </CardHeader>
          <CardContent>
            {referralCode ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Your referral code:</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 flex items-center justify-between px-4 py-2 border rounded-md">
                      <code className="font-mono">{referralCode}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyReferralCode}
                        className="ml-2"
                      >
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Share your referral code with friends and earn 10 MB for each friend who signs up and completes their first task.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Complete your profile to get your referral code and start earning rewards.
                </p>
                {showPhoneInput && <PhoneInput />}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your tasks and rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Button className="w-full" onClick={() => window.location.href = '/dashboard/tasks'}>
                <Activity className="mr-2 h-4 w-4" />
                View All Tasks
              </Button>
              <Button variant="outline" className="w-full" onClick={refreshTasks}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh Tasks
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
