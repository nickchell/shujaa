"use client"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Clock, Medal, Trophy, Share2, TrendingUp, Crown } from 'lucide-react';

interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  score: number;
  badge?: string;
  isYou?: boolean;
}

export default function LeaderboardPage() {
  const [leaderboardType, setLeaderboardType] = useState<'referrals' | 'earnings'>('referrals');
  
  const referralLeaders: LeaderboardUser[] = [
    { id: '1', rank: 1, name: 'James Mwangi', avatar: 'JM', score: 57, badge: 'Top Referrer' },
    { id: '2', rank: 2, name: 'Sarah Otieno', avatar: 'SO', score: 43 },
    { id: '3', rank: 3, name: 'David Ochieng', avatar: 'DO', score: 38 },
    { id: '4', rank: 4, name: 'Mary Wanjiku', avatar: 'MW', score: 35 },
    { id: '5', rank: 5, name: 'John Kamau', avatar: 'JK', score: 29 },
    { id: '6', rank: 6, name: 'Faith Muthoni', avatar: 'FM', score: 26 },
    { id: '7', rank: 7, name: 'Peter Njoroge', avatar: 'PN', score: 24 },
    { id: '8', rank: 8, name: 'Lucy Waithera', avatar: 'LW', score: 21 },
    { id: '9', rank: 9, name: 'George Kariuki', avatar: 'GK', score: 19 },
    { id: '10', rank: 10, name: 'Jane Wambui', avatar: 'JW', score: 17 },
    { id: '11', rank: 42, name: 'You', avatar: 'YO', score: 7, isYou: true },
  ];
  
  const earningsLeaders: LeaderboardUser[] = [
    { id: '1', rank: 1, name: 'Mary Wanjiku', avatar: 'MW', score: 3250, badge: 'Top Earner' },
    { id: '2', rank: 2, name: 'James Mwangi', avatar: 'JM', score: 2950 },
    { id: '3', rank: 3, name: 'Lucy Waithera', avatar: 'LW', score: 2780 },
    { id: '4', rank: 4, name: 'John Kamau', avatar: 'JK', score: 2500 },
    { id: '5', rank: 5, name: 'Sarah Otieno', avatar: 'SO', score: 2350 },
    { id: '6', rank: 6, name: 'George Kariuki', avatar: 'GK', score: 2100 },
    { id: '7', rank: 7, name: 'Faith Muthoni', avatar: 'FM', score: 1950 },
    { id: '8', rank: 8, name: 'David Ochieng', avatar: 'DO', score: 1800 },
    { id: '9', rank: 9, name: 'Jane Wambui', avatar: 'JW', score: 1650 },
    { id: '10', rank: 10, name: 'Peter Njoroge', avatar: 'PN', score: 1500 },
    { id: '11', rank: 37, name: 'You', avatar: 'YO', score: 650, isYou: true },
  ];

  const getLeaderboardData = () => {
    return leaderboardType === 'referrals' ? referralLeaders : earningsLeaders;
  };

  const getScoreUnit = () => {
    return leaderboardType === 'referrals' ? 'referrals' : 'points';
  };

  const topThree = getLeaderboardData().slice(0, 3);
  const otherLeaders = getLeaderboardData().slice(3, 10);
  const yourRanking = getLeaderboardData().find(user => user.isYou);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Leaderboard</h2>
        <p className="text-muted-foreground">
          See how you compare to other users on Rafiki Rewards.
        </p>
      </div>
      
      <Tabs value={leaderboardType} onValueChange={(value) => setLeaderboardType(value as 'referrals' | 'earnings')} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Updates weekly</span>
          </div>
        </div>
        
        <TabsContent value="referrals" className="space-y-8">
          {/* Top 3 Podium */}
          <div className="grid grid-cols-3 gap-4 h-64">
            {topThree.map((leader, index) => {
              // Calculate position specific styles
              const positions = [
                { height: 'h-4/5', textSize: 'text-xl', border: 'border-accent', badge: 'bg-accent' },
                { height: 'h-3/5', textSize: 'text-lg', border: 'border-secondary', badge: 'bg-secondary' },
                { height: 'h-2/5', textSize: 'text-base', border: 'border-primary', badge: 'bg-primary' },
              ];
              
              const position = positions[index];
              
              return (
                <div key={leader.id} className="flex flex-col items-center justify-end h-full">
                  <div className={`flex flex-col items-center p-4 bg-card border ${position.border} rounded-md w-full ${position.height}`}>
                    <div className="relative">
                      <Avatar className="w-16 h-16 border-2 border-background">
                        <AvatarFallback>{leader.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background flex items-center justify-center">
                        {index === 0 ? (
                          <Crown className="h-4 w-4 text-accent" />
                        ) : (
                          <span className="text-sm font-bold">{leader.rank}</span>
                        )}
                      </div>
                    </div>
                    <h3 className={`mt-2 font-bold ${position.textSize}`}>{leader.name}</h3>
                    <p className="text-muted-foreground">{leader.score} {getScoreUnit()}</p>
                    {leader.badge && (
                      <Badge className={`mt-2 ${position.badge}`}>{leader.badge}</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Rest of the Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>Top Referrers</CardTitle>
              <CardDescription>
                Users with the most successful referrals this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {otherLeaders.map((leader) => (
                  <div key={leader.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 flex items-center justify-center font-semibold">
                        {leader.rank}
                      </div>
                      <Avatar>
                        <AvatarFallback>{leader.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{leader.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold">{leader.score}</p>
                      <p className="text-sm text-muted-foreground">{getScoreUnit()}</p>
                    </div>
                  </div>
                ))}
                
                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t"></span>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-2 text-xs text-muted-foreground">Your Ranking</span>
                  </div>
                </div>
                
                {/* Your Ranking */}
                {yourRanking && (
                  <div className="flex items-center justify-between bg-muted/50 p-3 rounded-md">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 flex items-center justify-center font-semibold">
                        {yourRanking.rank}
                      </div>
                      <Avatar>
                        <AvatarFallback>{yourRanking.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{yourRanking.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold">{yourRanking.score}</p>
                      <p className="text-sm text-muted-foreground">{getScoreUnit()}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* How to Improve Card */}
          <Card>
            <CardHeader>
              <CardTitle>How to Climb the Leaderboard</CardTitle>
              <CardDescription>
                Tips to improve your ranking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Share2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Share Your Referral Link</p>
                  <p className="text-sm text-muted-foreground">Share on social media and with friends to get more referrals.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-full bg-secondary/10">
                  <TrendingUp className="h-4 w-4 text-secondary" />
                </div>
                <div>
                  <p className="font-medium">Complete All Daily Tasks</p>
                  <p className="text-sm text-muted-foreground">Regular task completion increases your points and ranking.</p>
                </div>
              </div>
              
              <Button className="w-full mt-2">
                <Share2 className="mr-2 h-4 w-4" />
                Share Your Referral Link
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="earnings" className="space-y-8">
          {/* Top 3 Podium */}
          <div className="grid grid-cols-3 gap-4 h-64">
            {topThree.map((leader, index) => {
              // Calculate position specific styles
              const positions = [
                { height: 'h-4/5', textSize: 'text-xl', border: 'border-accent', badge: 'bg-accent' },
                { height: 'h-3/5', textSize: 'text-lg', border: 'border-secondary', badge: 'bg-secondary' },
                { height: 'h-2/5', textSize: 'text-base', border: 'border-primary', badge: 'bg-primary' },
              ];
              
              const position = positions[index];
              
              return (
                <div key={leader.id} className="flex flex-col items-center justify-end h-full">
                  <div className={`flex flex-col items-center p-4 bg-card border ${position.border} rounded-md w-full ${position.height}`}>
                    <div className="relative">
                      <Avatar className="w-16 h-16 border-2 border-background">
                        <AvatarFallback>{leader.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background flex items-center justify-center">
                        {index === 0 ? (
                          <Crown className="h-4 w-4 text-accent" />
                        ) : (
                          <span className="text-sm font-bold">{leader.rank}</span>
                        )}
                      </div>
                    </div>
                    <h3 className={`mt-2 font-bold ${position.textSize}`}>{leader.name}</h3>
                    <p className="text-muted-foreground">{leader.score} {getScoreUnit()}</p>
                    {leader.badge && (
                      <Badge className={`mt-2 ${position.badge}`}>{leader.badge}</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Rest of the Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>Top Earners</CardTitle>
              <CardDescription>
                Users with the most points earned this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {otherLeaders.map((leader) => (
                  <div key={leader.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 flex items-center justify-center font-semibold">
                        {leader.rank}
                      </div>
                      <Avatar>
                        <AvatarFallback>{leader.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{leader.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold">{leader.score}</p>
                      <p className="text-sm text-muted-foreground">{getScoreUnit()}</p>
                    </div>
                  </div>
                ))}
                
                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t"></span>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-2 text-xs text-muted-foreground">Your Ranking</span>
                  </div>
                </div>
                
                {/* Your Ranking */}
                {yourRanking && (
                  <div className="flex items-center justify-between bg-muted/50 p-3 rounded-md">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 flex items-center justify-center font-semibold">
                        {yourRanking.rank}
                      </div>
                      <Avatar>
                        <AvatarFallback>{yourRanking.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{yourRanking.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold">{yourRanking.score}</p>
                      <p className="text-sm text-muted-foreground">{getScoreUnit()}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Monthly Rewards */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Rewards</CardTitle>
              <CardDescription>
                Special rewards for top performers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-full bg-accent/10">
                  <Trophy className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium">1st Place</p>
                  <p className="text-sm text-muted-foreground">1GB Data + Ksh 500 Airtime</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-full bg-secondary/10">
                  <Medal className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="font-medium">2nd Place</p>
                  <p className="text-sm text-muted-foreground">500MB Data + Ksh 200 Airtime</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Medal className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">3rd Place</p>
                  <p className="text-sm text-muted-foreground">250MB Data + Ksh 100 Airtime</p>
                </div>
              </div>
              
              <div className="relative pt-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t"></span>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-2 text-xs text-muted-foreground">Time Remaining</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Current competition ends in</div>
                <div className="flex justify-center space-x-2 mt-1">
                  <div className="bg-muted px-2 py-1 rounded">15</div>
                  <div>:</div>
                  <div className="bg-muted px-2 py-1 rounded">23</div>
                  <div>:</div>
                  <div className="bg-muted px-2 py-1 rounded">42</div>
                </div>
                <div className="flex justify-center space-x-8 mt-1 text-xs text-muted-foreground">
                  <div>Days</div>
                  <div>Hours</div>
                  <div>Minutes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}