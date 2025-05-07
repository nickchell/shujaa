"use client"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { User, Settings, Phone, Smartphone, Shield, Gift, Award, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  const [profile, setProfile] = useState({
    name: 'John Kamau',
    phone: '0712345678',
    email: 'john.kamau@example.com',
    level: 2,
    xp: 450,
    nextLevelXp: 1000,
    joinDate: '2023-04-15',
    referralCode: 'RAFIKI123',
    totalEarned: '250MB',
    totalReferrals: 7,
  });
  
  const [formState, setFormState] = useState({
    name: profile.name,
    phone: profile.phone,
    email: profile.email,
  });

  const badges = [
    {
      id: '1',
      name: 'Early Adopter',
      description: 'Joined in the first month',
      icon: Award,
      unlocked: true,
    },
    {
      id: '2',
      name: 'Referral Master',
      description: 'Referred 5+ friends',
      icon: User,
      unlocked: true,
    },
    {
      id: '3',
      name: 'Task Completer',
      description: 'Completed 20+ tasks',
      icon: CheckCircle,
      unlocked: true,
    },
    {
      id: '4',
      name: 'Data Hoarder',
      description: 'Earned 1GB+ of data',
      icon: Gift,
      unlocked: false,
    },
    {
      id: '5',
      name: 'Social Sharer',
      description: 'Shared on 3+ platforms',
      icon: Smartphone,
      unlocked: false,
    },
    {
      id: '6',
      name: 'Verified Account',
      description: 'Verified email and phone',
      icon: Shield,
      unlocked: true,
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const handleSave = () => {
    setProfile({
      ...profile,
      name: formState.name,
      phone: formState.phone,
      email: formState.email,
    });
    
    setIsEditing(false);
    
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
      duration: 3000,
    });
  };

  const unlockedBadges = badges.filter(badge => badge.unlocked);
  const lockedBadges = badges.filter(badge => !badge.unlocked);
  
  const levelProgress = (profile.xp / profile.nextLevelXp) * 100;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Your Profile</h2>
        <p className="text-muted-foreground">
          Manage your account information and track your progress.
        </p>
      </div>
      
      <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="text-2xl">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="mt-2">{profile.name}</CardTitle>
            <CardDescription>Member since {new Date(profile.joinDate).toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Level {profile.level}</span>
                <span>{profile.xp}/{profile.nextLevelXp} XP</span>
              </div>
              <Progress value={levelProgress} />
              <p className="text-xs text-muted-foreground text-center">
                {Math.round(profile.nextLevelXp - profile.xp)} XP needed for Level {profile.level + 1}
              </p>
            </div>
            
            <div className="pt-2 grid grid-cols-2 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-2xl font-bold">{profile.totalEarned}</p>
                <p className="text-xs text-muted-foreground">Total Earned</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{profile.totalReferrals}</p>
                <p className="text-xs text-muted-foreground">Referrals</p>
              </div>
            </div>
            
            <div className="pt-2 flex flex-wrap gap-2 justify-center">
              {unlockedBadges.slice(0, 3).map((badge) => (
                <div 
                  key={badge.id} 
                  className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center" 
                  title={badge.name}
                >
                  <badge.icon className="h-5 w-5 text-primary" />
                </div>
              ))}
              {unlockedBadges.length > 3 && (
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-sm font-medium">+{unlockedBadges.length - 3}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-8">
          <Tabs defaultValue="info" className="space-y-4">
            <TabsList>
              <TabsTrigger value="info">Account Info</TabsTrigger>
              <TabsTrigger value="badges">Badges</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Account Information</CardTitle>
                      <CardDescription>Manage your personal details</CardDescription>
                    </div>
                    <Button 
                      variant={isEditing ? "outline" : "default"}
                      size="sm"
                      onClick={() => {
                        if (isEditing) {
                          setFormState({
                            name: profile.name,
                            phone: profile.phone,
                            email: profile.email,
                          });
                        }
                        setIsEditing(!isEditing);
                      }}
                    >
                      {isEditing ? "Cancel" : "Edit"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input 
                        id="name" 
                        name="name" 
                        value={formState.name} 
                        onChange={handleInputChange} 
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{profile.name}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    {isEditing ? (
                      <Input 
                        id="phone" 
                        name="phone" 
                        value={formState.phone} 
                        onChange={handleInputChange} 
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    {isEditing ? (
                      <Input 
                        id="email" 
                        name="email" 
                        value={formState.email} 
                        onChange={handleInputChange} 
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{profile.email}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Referral Code</Label>
                    <div className="flex">
                      <Input 
                        value={profile.referralCode} 
                        readOnly 
                        className="font-mono text-center"
                      />
                      <Button variant="outline" className="ml-2 whitespace-nowrap">
                        Copy
                      </Button>
                    </div>
                  </div>
                </CardContent>
                {isEditing && (
                  <CardFooter>
                    <Button onClick={handleSave} className="w-full">
                      Save Changes
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>
            
            <TabsContent value="badges">
              <Card>
                <CardHeader>
                  <CardTitle>Your Badges</CardTitle>
                  <CardDescription>
                    Achievements you've unlocked on Rafiki Rewards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Unlocked Badges ({unlockedBadges.length})</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {unlockedBadges.map((badge) => (
                          <div key={badge.id} className="flex items-center space-x-4 p-3 rounded-lg border bg-muted/50">
                            <div className="p-2 rounded-full bg-primary/10">
                              <badge.icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{badge.name}</p>
                              <p className="text-sm text-muted-foreground">{badge.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {lockedBadges.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-4">Badges to Unlock ({lockedBadges.length})</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {lockedBadges.map((badge) => (
                            <div key={badge.id} className="flex items-center space-x-4 p-3 rounded-lg border opacity-70">
                              <div className="p-2 rounded-full bg-muted">
                                <badge.icon className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium">{badge.name}</p>
                                <p className="text-sm text-muted-foreground">{badge.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your account security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPhone">Current Phone Number</Label>
                    <div className="flex space-x-2">
                      <Input id="currentPhone" value={profile.phone} readOnly />
                      <Button variant="outline">Verify</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notifications">Notification Preferences</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="smsNotifications" className="flex items-center space-x-2 cursor-pointer">
                          <span>SMS Notifications</span>
                        </Label>
                        <Switch id="smsNotifications" checked={true} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="emailNotifications" className="flex items-center space-x-2 cursor-pointer">
                          <span>Email Notifications</span>
                        </Label>
                        <Switch id="emailNotifications" checked={false} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="marketingEmails" className="flex items-center space-x-2 cursor-pointer">
                          <span>Marketing Emails</span>
                        </Label>
                        <Switch id="marketingEmails" checked={false} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button className="w-full" variant="destructive">
                      Deactivate Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}