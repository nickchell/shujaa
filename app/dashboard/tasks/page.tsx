"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Check, Gift, Tv, Send, Globe, RefreshCw, CheckCircle2, DivideIcon as LucideIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  title: string;
  description: string;
  reward: string;
  status: 'completed' | 'available' | 'locked';
  icon: typeof LucideIcon;  // Update this line to use 'typeof LucideIcon'
  category: 'daily' | 'weekly' | 'special';
  timeLeft?: string;
  progress?: number;
}

export default function TasksPage() {
  const { toast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Watch Daily Video',
      description: 'Watch a short video to earn data rewards',
      reward: '5MB',
      status: 'available',
      icon: Tv,
      category: 'daily',
    },
    {
      id: '2',
      title: 'Refer a Friend',
      description: 'Invite a friend to join Rafiki Rewards',
      reward: '50MB',
      status: 'available',
      icon: Send,
      category: 'daily',
    },
    {
      id: '3',
      title: 'Daily Check-in',
      description: 'Check in to the app daily',
      reward: '10MB',
      status: 'completed',
      icon: Check,
      category: 'daily',
    },
    {
      id: '4',
      title: 'Visit Partner Website',
      description: 'Visit our partner website and stay for 30 seconds',
      reward: '15MB',
      status: 'available',
      icon: Globe,
      category: 'daily',
    },
    {
      id: '5',
      title: 'Complete Weekly Survey',
      description: 'Answer a few questions about your experience',
      reward: '25MB',
      status: 'available',
      icon: CheckCircle2,
      category: 'weekly',
      progress: 0,
    },
    {
      id: '6',
      title: 'Refer 5 Friends This Week',
      description: 'Invite 5 friends to join Rafiki Rewards',
      reward: '100MB',
      status: 'available',
      icon: Send,
      category: 'weekly',
      progress: 20,
    },
    {
      id: '7',
      title: 'Watch 10 Videos This Week',
      description: 'Watch 10 short videos to earn a bigger reward',
      reward: '75MB',
      status: 'available',
      icon: Tv,
      category: 'weekly',
      progress: 30,
    },
    {
      id: '8',
      title: 'Special Promotion: Telkom',
      description: 'Sign up for a Telkom service to earn a bonus',
      reward: '500MB',
      status: 'available',
      icon: Gift,
      category: 'special',
    },
  ]);

  const completeTask = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        if (task.category === 'weekly' && task.progress !== undefined) {
          const newProgress = task.progress + 20;
          if (newProgress >= 100) {
            toast({
              title: "Task Completed!",
              description: `You've earned ${task.reward} data bundle.`,
              duration: 3000,
            });
            return { ...task, status: 'completed', progress: 100 };
          } else {
            toast({
              title: "Progress Updated!",
              description: `You're making progress on this task.`,
              duration: 3000,
            });
            return { ...task, progress: newProgress };
          }
        } else {
          toast({
            title: "Task Completed!",
            description: `You've earned ${task.reward} data bundle.`,
            duration: 3000,
          });
          return { ...task, status: 'completed' };
        }
      }
      return task;
    }));
  };

  const resetTask = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, status: 'available', progress: task.category === 'weekly' ? 0 : undefined };
      }
      return task;
    }));
  };

  const dailyTasks = tasks.filter(task => task.category === 'daily');
  const weeklyTasks = tasks.filter(task => task.category === 'weekly');
  const specialTasks = tasks.filter(task => task.category === 'special');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
        <p className="text-muted-foreground">
          Complete tasks to earn rewards and level up.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-semibold">Your Progress</h3>
          <p className="text-sm text-muted-foreground">4 of 8 tasks completed today</p>
        </div>
        <div className="bg-muted p-2 rounded-lg text-center">
          <p className="text-sm font-medium">Level 2</p>
          <p className="text-xs text-muted-foreground">250 XP to Level 3</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Level Progress</span>
          <span>45%</span>
        </div>
        <Progress value={45} className="h-2" />
      </div>

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily Tasks</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Tasks</TabsTrigger>
          <TabsTrigger value="special">Special Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {dailyTasks.map((task) => (
              <Card key={task.id} className={task.status === 'completed' ? 'bg-muted/30' : ''}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-full ${
                      task.status === 'completed' ? 'bg-primary/10' : 'bg-secondary/10'
                    }`}>
                      <task.icon className={`h-4 w-4 ${
                        task.status === 'completed' ? 'text-primary' : 'text-secondary'
                      }`} />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
                      <CardDescription>{task.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={task.status === 'completed' ? 'outline' : 'default'}>
                    {task.reward}
                  </Badge>
                </CardHeader>
                <CardFooter className="pt-2">
                  {task.status === 'completed' ? (
                    <Button variant="outline" className="w-full" size="sm" onClick={() => resetTask(task.id)}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reset for Demo
                    </Button>
                  ) : (
                    <Button className="w-full" size="sm" onClick={() => completeTask(task.id)}>
                      Complete Task
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {weeklyTasks.map((task) => (
              <Card key={task.id} className={task.status === 'completed' ? 'bg-muted/30' : ''}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-full ${
                      task.status === 'completed' ? 'bg-primary/10' : 'bg-secondary/10'
                    }`}>
                      <task.icon className={`h-4 w-4 ${
                        task.status === 'completed' ? 'text-primary' : 'text-secondary'
                      }`} />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
                      <CardDescription>{task.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={task.status === 'completed' ? 'outline' : 'default'}>
                    {task.reward}
                  </Badge>
                </CardHeader>
                <CardContent className="pb-2 pt-0">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span>Progress</span>
                      <span>{task.progress}%</span>
                    </div>
                    <Progress value={task.progress} className="h-1" />
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  {task.status === 'completed' ? (
                    <Button variant="outline" className="w-full" size="sm" onClick={() => resetTask(task.id)}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reset for Demo
                    </Button>
                  ) : (
                    <Button className="w-full" size="sm" onClick={() => completeTask(task.id)}>
                      Make Progress
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="special" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {specialTasks.map((task) => (
              <Card key={task.id} className={`${task.status === 'completed' ? 'bg-muted/30' : ''} border-accent/50`}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-full ${
                      task.status === 'completed' ? 'bg-primary/10' : 'bg-accent/10'
                    }`}>
                      <task.icon className={`h-4 w-4 ${
                        task.status === 'completed' ? 'text-primary' : 'text-accent'
                      }`} />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
                      <CardDescription>{task.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-accent text-accent-foreground">
                    {task.reward}
                  </Badge>
                </CardHeader>
                <CardFooter className="pt-2">
                  {task.status === 'completed' ? (
                    <Button variant="outline" className="w-full" size="sm" onClick={() => resetTask(task.id)}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reset for Demo
                    </Button>
                  ) : (
                    <Button className="w-full" size="sm" onClick={() => completeTask(task.id)}>
                      Complete Special Task
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
