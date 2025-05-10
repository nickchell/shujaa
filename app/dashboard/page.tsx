'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Users, Gift, Share2, CheckCircle, TrendingUp, Eye, Clock, RefreshCw, Trophy, Star } from 'lucide-react';
import { DashboardRecentActivity } from '@/components/dashboard/recent-activity';
import { DashboardChart } from '@/components/dashboard/dashboard-chart';

export default function DashboardPage() {
  const { user } = useUser();
  
  const [greetingMessage, setGreetingMessage] = useState('');
  
  // Function to get the greeting message and emoji based on the time of day
  const getGreetingMessage = () => {
    const hour = new Date().getHours();
    let greeting = '';
    let emojis = [];

    if (hour < 12) {
      greeting = 'Good morning';
      emojis = ['☀️', '☀️', '☕']; // Morning emojis
    } else if (hour < 18) {
      greeting = 'Good afternoon';
      emojis = ['🌟', '🚀', '💼']; // Afternoon emojis
    } else {
      greeting = 'Good evening';
      emojis = ['🌙', '🌙', '🌙']; // Evening emojis
    }

    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const userName = user?.firstName || 'User'; // Use first name or fallback to 'User'
    return `${greeting}, ${userName}! ${randomEmoji}`;
  };

  useEffect(() => {
    setGreetingMessage(getGreetingMessage());
  }, [user, getGreetingMessage]);

  const firstNameRaw =
    user?.firstName ||
    user?.emailAddresses?.[0]?.emailAddress.split('@')[0].split('.')[0] ||
    'User';

  const firstName = firstNameRaw.charAt(0).toUpperCase() + firstNameRaw.slice(1);

  const userProfile = {
    name: firstName,
    shujaaType: 'Hustler',
    level: 2,
    xp: 450,
    nextLevelXp: 1000,
    dailyStreak: 5,
    primaryGoal: 'data',
  };

  const progress = (userProfile.xp / userProfile.nextLevelXp) * 100;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {greetingMessage}
          </h2>
          <p className="text-muted-foreground">
            Keep hustling! You're on a {userProfile.dailyStreak}-day streak 🔥
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-right">
            <p className="text-sm font-medium">Level {userProfile.level}</p>
            <p className="text-xs text-muted-foreground">{userProfile.xp} XP</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Progress to Level {userProfile.level + 1}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground text-right">
          {userProfile.nextLevelXp - userProfile.xp} XP needed
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <Gift className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">250 MB</div>
            <p className="text-xs text-muted-foreground">+20% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Referrals</CardTitle>
            <Share2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">+2 new this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">5 pending today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Rafiki Rank</CardTitle>
            <Star className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#42</div>
            <p className="text-xs text-muted-foreground">Up 10 positions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Earnings Overview</CardTitle>
            <CardDescription>
              Your {userProfile.primaryGoal === 'data' ? 'data bundle' : 'reward'} earnings over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent rewards and referrals</CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardRecentActivity />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}