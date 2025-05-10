"use client"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Gift, Clock, Phone, Smartphone, Wifi, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils/date';

interface Reward {
  id: string;
  title: string;
  description: string;
  amount: string;
  cost: number;
  category: 'data' | 'airtime' | 'special';
  available: boolean;
}

interface ClaimedReward {
  id: string;
  title: string;
  amount: string;
  date: string;
  used: boolean;
}

export default function RewardsPage() {
  const { toast } = useToast();
  const [points, setPoints] = useState(150);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  
  const [rewards, setRewards] = useState<Reward[]>([
    {
      id: '1',
      title: 'Daily Data',
      description: 'Get a small data bundle to browse the web',
      amount: '10MB',
      cost: 50,
      category: 'data',
      available: true,
    },
    {
      id: '2',
      title: 'Weekly Data',
      description: 'Medium data bundle for regular usage',
      amount: '50MB',
      cost: 150,
      category: 'data',
      available: true,
    },
    {
      id: '3',
      title: 'Monthly Data',
      description: 'Larger data bundle for heavy users',
      amount: '150MB',
      cost: 300,
      category: 'data',
      available: true,
    },
    {
      id: '4',
      title: 'Basic Airtime',
      description: 'Small airtime voucher for calls and SMS',
      amount: 'Ksh 20',
      cost: 100,
      category: 'airtime',
      available: true,
    },
    {
      id: '5',
      title: 'Standard Airtime',
      description: 'Medium airtime voucher for regular users',
      amount: 'Ksh 50',
      cost: 200,
      category: 'airtime',
      available: true,
    },
    {
      id: '6',
      title: 'Premium Airtime',
      description: 'Larger airtime voucher for heavy callers',
      amount: 'Ksh 100',
      cost: 350,
      category: 'airtime',
      available: true,
    },
    {
      id: '7',
      title: 'Special: Weekend Data',
      description: 'Data bundle valid for weekend use only',
      amount: '500MB',
      cost: 400,
      category: 'special',
      available: true,
    },
    {
      id: '8',
      title: 'Special: Night Owl',
      description: 'Data bundle valid from 10PM to 6AM',
      amount: '1GB',
      cost: 300,
      category: 'special',
      available: true,
    },
  ]);
  
  const [claimedRewards, setClaimedRewards] = useState<ClaimedReward[]>([
    {
      id: '1',
      title: 'Daily Data',
      amount: '10MB',
      date: '2023-05-20',
      used: true,
    },
    {
      id: '2',
      title: 'Basic Airtime',
      amount: 'Ksh 20',
      date: '2023-05-22',
      used: true,
    },
    {
      id: '3',
      title: 'Daily Data',
      amount: '10MB',
      date: '2023-05-25',
      used: false,
    },
  ]);

  const claimReward = (reward: Reward) => {
    if (points >= reward.cost) {
      setPoints(points - reward.cost);
      
      // Add to claimed rewards
      const newClaimed: ClaimedReward = {
        id: Date.now().toString(),
        title: reward.title,
        amount: reward.amount,
        date: new Date().toISOString().split('T')[0],
        used: false,
      };
      
      setClaimedRewards([newClaimed, ...claimedRewards]);
      
      toast({
        title: "Reward Claimed!",
        description: `You've successfully claimed ${reward.amount} ${reward.category === 'data' ? 'data' : 'airtime'}.`,
        duration: 3000,
      });
    } else {
      toast({
        title: "Not Enough Points",
        description: "You don't have enough points to claim this reward.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const dataRewards = rewards.filter(reward => reward.category === 'data');
  const airtimeRewards = rewards.filter(reward => reward.category === 'airtime');
  const specialRewards = rewards.filter(reward => reward.category === 'special');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Rewards</h2>
        <p className="text-muted-foreground">
          Redeem your points for data bundles, airtime, and special rewards.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{points} points</div>
            <p className="text-xs text-muted-foreground">Complete tasks to earn more points</p>
          </CardContent>
        </Card>
        
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Claimed Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{claimedRewards.length}</div>
            <p className="text-xs text-muted-foreground">Total rewards claimed</p>
          </CardContent>
        </Card>
        
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Next Milestone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">500 MB</div>
            <p className="text-xs text-muted-foreground">Refer 5 more friends</p>
          </CardContent>
        </Card>
      </div>
      
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Rewards are sent to the phone number associated with your account. Make sure your details are up-to-date.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="data" className="space-y-4">
        <TabsList>
          <TabsTrigger value="data">Data Bundles</TabsTrigger>
          <TabsTrigger value="airtime">Airtime</TabsTrigger>
          <TabsTrigger value="special">Special Offers</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        {/* Data Bundles Tab */}
        <TabsContent value="data" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {dataRewards.map((reward) => (
              <Card key={reward.id} className={!reward.available ? 'opacity-60' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{reward.title}</CardTitle>
                      <CardDescription>{reward.description}</CardDescription>
                    </div>
                    <div className="bg-secondary/10 text-secondary rounded-full p-2">
                      <Wifi className="h-4 w-4" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reward.amount}</div>
                  <p className="text-sm text-muted-foreground">{reward.cost} points</p>
                </CardContent>
                <CardFooter>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full" 
                        variant={points >= reward.cost ? "default" : "outline"}
                        onClick={() => setSelectedReward(reward)}
                        disabled={!reward.available}
                      >
                        {points >= reward.cost ? "Claim Reward" : "Not Enough Points"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Reward Claim</DialogTitle>
                        <DialogDescription>
                          You are about to claim {selectedReward?.amount} data. This will be sent to your registered number.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Reward:</span>
                          <span className="font-medium">{selectedReward?.title}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-medium">{selectedReward?.amount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Cost:</span>
                          <span className="font-medium">{selectedReward?.cost} points</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Your Points:</span>
                          <span className="font-medium">{points} points</span>
                        </div>
                        <Progress value={(points / (selectedReward?.cost || 1)) * 100} />
                      </div>
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => setSelectedReward(null)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={() => {
                            if (selectedReward) {
                              claimReward(selectedReward);
                              setSelectedReward(null);
                            }
                          }}
                          disabled={selectedReward ? points < selectedReward.cost : true}
                        >
                          Confirm Claim
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Airtime Tab */}
        <TabsContent value="airtime" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {airtimeRewards.map((reward) => (
              <Card key={reward.id} className={!reward.available ? 'opacity-60' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{reward.title}</CardTitle>
                      <CardDescription>{reward.description}</CardDescription>
                    </div>
                    <div className="bg-primary/10 text-primary rounded-full p-2">
                      <Phone className="h-4 w-4" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reward.amount}</div>
                  <p className="text-sm text-muted-foreground">{reward.cost} points</p>
                </CardContent>
                <CardFooter>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full" 
                        variant={points >= reward.cost ? "default" : "outline"}
                        onClick={() => setSelectedReward(reward)}
                        disabled={!reward.available}
                      >
                        {points >= reward.cost ? "Claim Reward" : "Not Enough Points"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Reward Claim</DialogTitle>
                        <DialogDescription>
                          You are about to claim {selectedReward?.amount} airtime. This will be sent to your registered number.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Reward:</span>
                          <span className="font-medium">{selectedReward?.title}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-medium">{selectedReward?.amount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Cost:</span>
                          <span className="font-medium">{selectedReward?.cost} points</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Your Points:</span>
                          <span className="font-medium">{points} points</span>
                        </div>
                        <Progress value={(points / (selectedReward?.cost || 1)) * 100} />
                      </div>
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => setSelectedReward(null)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={() => {
                            if (selectedReward) {
                              claimReward(selectedReward);
                              setSelectedReward(null);
                            }
                          }}
                          disabled={selectedReward ? points < selectedReward.cost : true}
                        >
                          Confirm Claim
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Special Offers Tab */}
        <TabsContent value="special" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {specialRewards.map((reward) => (
              <Card key={reward.id} className={`${!reward.available ? 'opacity-60' : ''} border-accent/50`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{reward.title}</CardTitle>
                      <CardDescription>{reward.description}</CardDescription>
                    </div>
                    <div className="bg-accent/10 text-accent rounded-full p-2">
                      <Gift className="h-4 w-4" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reward.amount}</div>
                  <p className="text-sm text-muted-foreground">{reward.cost} points</p>
                  <Badge variant="outline" className="mt-2 bg-accent/10 text-accent border-accent/30">
                    Limited Time Offer
                  </Badge>
                </CardContent>
                <CardFooter>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full" 
                        variant={points >= reward.cost ? "default" : "outline"}
                        onClick={() => setSelectedReward(reward)}
                        disabled={!reward.available}
                      >
                        {points >= reward.cost ? "Claim Special Offer" : "Not Enough Points"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Special Offer Claim</DialogTitle>
                        <DialogDescription>
                          You are about to claim a special offer. This will be sent to your registered number.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Reward:</span>
                          <span className="font-medium">{selectedReward?.title}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-medium">{selectedReward?.amount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Cost:</span>
                          <span className="font-medium">{selectedReward?.cost} points</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Your Points:</span>
                          <span className="font-medium">{points} points</span>
                        </div>
                        <Progress value={(points / (selectedReward?.cost || 1)) * 100} />
                      </div>
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => setSelectedReward(null)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={() => {
                            if (selectedReward) {
                              claimReward(selectedReward);
                              setSelectedReward(null);
                            }
                          }}
                          disabled={selectedReward ? points < selectedReward.cost : true}
                        >
                          Confirm Claim
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Reward History</CardTitle>
              <CardDescription>
                Your claimed rewards and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {claimedRewards.length > 0 ? (
                <div className="space-y-4">
                  {claimedRewards.map((reward) => (
                    <div key={reward.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${reward.used ? 'bg-muted' : 'bg-secondary/10'}`}>
                          {reward.title.includes('Data') ? (
                            <Wifi className={`h-4 w-4 ${reward.used ? 'text-muted-foreground' : 'text-secondary'}`} />
                          ) : (
                            <Phone className={`h-4 w-4 ${reward.used ? 'text-muted-foreground' : 'text-primary'}`} />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{reward.title}</div>
                          <div className="text-sm text-muted-foreground">
                            Claimed on {formatDate(reward.date)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-4 text-right">
                          <div className="font-medium">{reward.amount}</div>
                          <div className={`text-xs px-2 py-0.5 rounded ${
                            reward.used 
                              ? 'bg-muted text-muted-foreground' 
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          }`}>
                            {reward.used ? 'Used' : 'Available'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Gift className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p>You haven't claimed any rewards yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}