'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Share2, Users, Trophy, Check } from 'lucide-react';
import { getReferralCode, getReferralStats, getReferralProgress, getReferrals } from '@/lib/supabase/referrals';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils/date';
import type { ReferralTier, Referral } from '@/lib/supabase/referrals';

export function ReferralStats() {
  const { user } = useUser();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    total_rewards: 0,
    lastUpdated: new Date().toISOString()
  });
  const [progress, setProgress] = useState<{
    currentTier: ReferralTier;
    nextTier: ReferralTier | null;
    progress: { current: number; next: number; percentage: number; };
  }>({
    currentTier: { level: 1, min_referrals: 0, reward_amount: 50, description: '50MB per referral' },
    nextTier: null,
    progress: { current: 0, next: 10, percentage: 0 }
  });
  const [referrals, setReferrals] = useState<Referral[]>([]);

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Get referral code
      const response = await fetch('/api/referrals/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get referral code');
      }

      const data = await response.json();
      if (!data.referralCode) {
        throw new Error('No referral code in response');
      }

      setReferralCode(data.referralCode);

      // Get referral stats
      const stats = await getReferralStats(user.id);
      setStats(stats);

      // Get referral progress
      const progress = await getReferralProgress(user.id);
      setProgress(progress);

      // Get referrals
      const referrals = await getReferrals(user.id);
      const mappedReferrals = referrals.map(referral => ({
        ...referral,
        referrer_id: user.id
      }));
      setReferrals(mappedReferrals);

    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load referral data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  if (!user) return null;

  const referralLink = referralCode 
    ? `https://shujaa.vercel.app/welcome?ref=${referralCode}`
    : null;

  const copyReferralLink = async () => {
    if (!referralLink) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(referralLink);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = referralLink;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          textArea.remove();
        } catch (err) {
          textArea.remove();
          throw new Error('Failed to copy text');
        }
      }

      setIsCopied(true);
      toast({
        title: "Link copied!",
        description: "Your referral link has been copied to clipboard.",
      });

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy referral link. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            {stats.total === 0 ? 'Start referring friends to earn rewards!' : 'Total friends referred'}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completed}</div>
          <p className="text-xs text-muted-foreground">
            {stats.completed === 0 ? 'No completed referrals yet' : 'Referrals that earned rewards'}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pending}</div>
          <p className="text-xs text-muted-foreground">
            {stats.pending === 0 ? 'No pending referrals' : 'Referrals in progress'}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_rewards}MB</div>
          <p className="text-xs text-muted-foreground">
            {stats.total_rewards === 0 ? 'Start referring to earn rewards!' : 'Total rewards earned'}
          </p>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Referral Progress</CardTitle>
          <CardDescription>
            {progress.nextTier 
              ? `Complete ${progress.progress.next - progress.progress.current} more referrals to reach the next tier`
              : 'You have reached the highest tier!'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Current Tier: {progress.currentTier.level}</span>
              <span>{progress.progress.current} / {progress.progress.next} referrals</span>
            </div>
            <Progress value={progress.progress.percentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progress.currentTier.description}</span>
              {progress.nextTier && <span>{progress.nextTier.description}</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
          <CardDescription>
            Share this link with your friends to start earning rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
              {isLoading ? 'Loading...' : referralLink || 'No referral code available'}
            </code>
            <Button
              onClick={copyReferralLink}
              disabled={!referralLink || isLoading}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              {isCopied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="mr-2 h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 