"use client"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Share2, Copy, Facebook, MessageCircle, Mail, Twitter } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface ReferralUser {
  id: string;
  name: string;
  date: string;
  status: 'active' | 'inactive';
  reward: string;
}

export default function ReferralsPage() {
  const { toast } = useToast();
  const [referralCode] = useState('RAFIKI123');
  const [referralLink] = useState('https://rafiki.ke/r/RAFIKI123');
  
  const [referrals, setReferrals] = useState<ReferralUser[]>([
    { id: '1', name: 'John Kamau', date: '2023-05-15', status: 'active', reward: '50MB' },
    { id: '2', name: 'Mary Wanjiku', date: '2023-05-17', status: 'active', reward: '50MB' },
    { id: '3', name: 'David Ochieng', date: '2023-05-20', status: 'active', reward: '50MB' },
    { id: '4', name: 'Sarah Otieno', date: '2023-05-22', status: 'inactive', reward: '0MB' },
    { id: '5', name: 'James Mwangi', date: '2023-05-25', status: 'active', reward: '50MB' },
    { id: '6', name: 'Lucy Muthoni', date: '2023-05-27', status: 'active', reward: '50MB' },
    { id: '7', name: 'Peter Njoroge', date: '2023-05-30', status: 'inactive', reward: '0MB' },
  ]);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `Your referral ${type} has been copied to clipboard.`,
        duration: 3000,
      });
    }).catch(err => {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy manually.",
        variant: "destructive",
        duration: 3000,
      });
    });
  };

  const shareViaWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=Join%20Rafiki%20Rewards%20and%20get%20free%20data!%20Use%20my%20referral%20code:%20${referralCode}%20or%20sign%20up%20here:%20${encodeURIComponent(referralLink)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=Join%20Rafiki%20Rewards%20and%20get%20free%20data!%20Use%20my%20referral%20code:%20${referralCode}`;
    window.open(facebookUrl, '_blank');
  };

  const shareViaTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=Join%20Rafiki%20Rewards%20and%20get%20free%20data!%20Use%20my%20referral%20code:%20${referralCode}&url=${encodeURIComponent(referralLink)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareViaEmail = () => {
    const emailSubject = "Join Rafiki Rewards and get free data!";
    const emailBody = `Hi there,\n\nI thought you might be interested in Rafiki Rewards. You can earn free data by completing simple tasks and referring friends.\n\nUse my referral code: ${referralCode} or sign up here: ${referralLink}\n\nCheers!`;
    window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
  };

  const activeReferrals = referrals.filter(ref => ref.status === 'active').length;
  const nextTierReferrals = 10;
  const progress = (activeReferrals / nextTierReferrals) * 100;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Referrals</h2>
        <p className="text-muted-foreground">
          Invite friends and earn rewards when they join and complete tasks.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
            <CardDescription>
              Share this link with friends to earn rewards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input value={referralLink} readOnly className="font-mono text-sm" />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(referralLink, 'link')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <div>
              <div className="text-sm font-medium">Referral Code</div>
              <div className="flex mt-1 space-x-2">
                <Input value={referralCode} readOnly className="font-mono text-lg text-center" />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(referralCode, 'code')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col space-y-4">
            <div className="text-sm font-medium w-full">Share via</div>
            <div className="flex flex-wrap gap-2 w-full">
              <Button variant="outline" className="flex-1" onClick={shareViaWhatsApp}>
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
              <Button variant="outline" className="flex-1" onClick={shareViaFacebook}>
                <Facebook className="mr-2 h-4 w-4" />
                Facebook
              </Button>
              <Button variant="outline" className="flex-1" onClick={shareViaTwitter}>
                <Twitter className="mr-2 h-4 w-4" />
                Twitter
              </Button>
              <Button variant="outline" className="flex-1" onClick={shareViaEmail}>
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Button>
            </div>
          </CardFooter>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Referral Rewards</CardTitle>
            <CardDescription>
              Your current tier and progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Tier 1</h3>
                <div className="text-sm bg-primary/10 text-primary rounded-full px-2 py-1">
                  Current Tier
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                You've referred {activeReferrals} active friends
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress to Tier 2</span>
                  <span>{activeReferrals} of {nextTierReferrals}</span>
                </div>
                <Progress value={progress} />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="text-sm font-medium">Reward Tiers</div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm p-2 rounded border bg-muted/50">
                  <div className="font-medium">Tier 1 (0-9 referrals)</div>
                  <div>50MB per referral</div>
                </div>
                <div className="flex justify-between items-center text-sm p-2 rounded border">
                  <div className="font-medium">Tier 2 (10-24 referrals)</div>
                  <div>75MB per referral</div>
                </div>
                <div className="flex justify-between items-center text-sm p-2 rounded border">
                  <div className="font-medium">Tier 3 (25+ referrals)</div>
                  <div>100MB per referral</div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">
              <Share2 className="mr-2 h-4 w-4" />
              Invite More Friends
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Referrals</CardTitle>
          <CardDescription>
            List of people who signed up using your referral code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Date Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Your Reward</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrals.map((referral) => (
                <TableRow key={referral.id}>
                  <TableCell className="font-medium">{referral.name}</TableCell>
                  <TableCell>{new Date(referral.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      referral.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {referral.status === 'active' ? 'Active' : 'Inactive'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{referral.reward}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}