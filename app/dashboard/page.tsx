import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Users, Gift, Share2, CheckCircle, TrendingUp, Eye, Clock, RefreshCw, Trophy, Star } from 'lucide-react';
import { DashboardRecentActivity } from '@/components/dashboard/recent-activity';
import { DashboardChart } from '@/components/dashboard/dashboard-chart';

export default function DashboardPage() {
  // This would come from your user context/state in a real app
  const userProfile = {
    name: "John",
    shujaaType: "Hustler",
    level: 2,
    xp: 450,
    nextLevelXp: 1000,
    dailyStreak: 5,
    primaryGoal: "data",
  };

  const progress = (userProfile.xp / userProfile.nextLevelXp) * 100;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, {userProfile.name} the {userProfile.shujaaType}!
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
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Shujaa Rank</CardTitle>
            <Star className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#42</div>
            <p className="text-xs text-muted-foreground">Up 10 positions</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
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
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your recent rewards and referrals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardRecentActivity />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Personalized Quick Actions */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Recommended tasks for {userProfile.shujaaType}s
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" variant="default">
              <Eye className="mr-2 h-4 w-4" />
              Watch Daily Ad (+5MB)
            </Button>
            <Button className="w-full" variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Share Your Progress
            </Button>
            <Button className="w-full" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Invite Friends
            </Button>
          </CardContent>
        </Card>
        
        {/* Daily Tasks Progress */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Today's Tasks</CardTitle>
            <CardDescription>
              3 of 5 tasks completed today
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Watch 2 Ads</span>
                </div>
                <span className="text-primary">Completed</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Refer A Friend</span>
                </div>
                <span className="text-primary">Completed</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Daily Check-In</span>
                </div>
                <span className="text-primary">Completed</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Complete Survey</span>
                </div>
                <span className="text-muted-foreground">Pending</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Visit Partner Website</span>
                </div>
                <span className="text-muted-foreground">Pending</span>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span>60%</span>
              </div>
              <Progress value={60} />
            </div>
            
            <Button asChild className="w-full">
              <Link href="/dashboard/tasks">View All Tasks</Link>
            </Button>
          </CardContent>
        </Card>
        
        {/* Next Reward Card */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Next Milestone</CardTitle>
            <CardDescription>
              You're close to your next reward!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-card p-4 text-center">
              <div className="mb-2">
                <Gift className="mx-auto h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">100MB Data Bundle</h3>
              <p className="text-sm text-muted-foreground">
                Complete 2 more tasks to claim
              </p>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span>80%</span>
              </div>
              <Progress value={80} />
            </div>
            
            <Button asChild className="w-full">
              <Link href="/dashboard/rewards">View All Rewards</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}