'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getReferralCode, getReferralStats } from '@/lib/supabase/referrals';
import { useUser } from '@clerk/nextjs';
import { config } from '@/lib/config';

// Use the centralized config for the referral URL

interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalRewards: number;
}

export function ReferralStats() {
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralLink, setReferralLink] = useState<string>('');
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    completedReferrals: 0,
    pendingReferrals: 0,
    totalRewards: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user || !isLoaded) return;

    try {
      setIsLoading(true);
      
      // Load stats first
      const statsData = await getReferralStats(user.id);
      if (statsData) {
        setStats(statsData);
      }

      // Then try to get the referral code
      try {
        const code = await getReferralCode(user.id);
        if (code) {
          setReferralCode(code);
          // Generate the full referral URL using the config
          const link = `${config.referralUrl}?ref=${encodeURIComponent(code)}`;
          setReferralLink(link);
        }
      } catch (error) {
        console.error('Failed to get referral code:', error);
        toast({
          title: "Notice",
          description: "Your referral code could not be loaded. Please refresh to try again.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error loading referral data:', error);
      toast({
        title: "Error",
        description: "Failed to load referral data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, isLoaded, toast]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [loadData]);

  // Add debug logging for link and code
  useEffect(() => {
    if (referralCode) {
      console.log('Referral stats component - Code:', referralCode);
      console.log('Referral stats component - Link:', referralLink);
    }
  }, [referralCode, referralLink]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: "Success",
        description: "Referral link copied to clipboard!",
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Error",
        description: "Failed to copy referral link. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Please sign in to view your referral stats.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '-' : stats.totalReferrals}</div>
          <p className="text-xs text-muted-foreground">
            Total people who signed up using your code
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '-' : stats.completedReferrals}</div>
          <p className="text-xs text-muted-foreground">
            Referrals that have completed their tasks
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '-' : stats.pendingReferrals}</div>
          <p className="text-xs text-muted-foreground">
            Referrals waiting to complete tasks
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '-' : `${stats.totalRewards}MB`}</div>
          <p className="text-xs text-muted-foreground">
            Total data rewards earned
          </p>
        </CardContent>
      </Card>
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Share with Friends</CardTitle>
          <CardDescription>
            Share your referral link to earn rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {
                const url = encodeURIComponent(referralLink);
                const text = encodeURIComponent('Join me on Rafiki Rewards and get free data bundles! Use my referral link:');
                window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {
                const url = encodeURIComponent(referralLink);
                const text = encodeURIComponent('Join me on Rafiki Rewards and get free data bundles! Use my referral link:');
                window.open(`https://telegram.me/share/url?url=${url}&text=${text}`, '_blank');
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#0088cc">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.119.098.152.228.169.331.029.14.015.482-.002.681z"/>
              </svg>
              Telegram
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={copyToClipboard}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#000000">
                <path d="M16 1H8C4.691 1 2 3.691 2 7v10c0 3.309 2.691 6 6 6h8c3.309 0 6-2.691 6-6V7c0-3.309-2.691-6-6-6zm0 12H8V7h8v6zm-6 2h8v2H4v-2h8z"/>
              </svg>
              Copy Link
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}