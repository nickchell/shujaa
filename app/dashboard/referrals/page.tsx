"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Share2, Facebook, MessageCircle, Mail, Twitter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils/date';
import { ReferralStats } from '@/components/dashboard/referral-stats';
import { getReferrals } from '@/lib/supabase/referrals';
import { useUser } from '@clerk/nextjs';

// Define the type for the mapped referral objects
interface ReferralTableRow {
  id: string;
  name: string;
  email?: string;
  date: string;
  status: string;
  reward: string;
}

export default function ReferralsPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [referrals, setReferrals] = useState<ReferralTableRow[]>([]);

  useEffect(() => {
    async function loadReferrals() {
      if (!user) return;
      const data = await getReferrals(user.id);
      const mappedData = data.map(referral => ({
        id: referral.id,
        name: referral.users?.[0]?.full_name || 'Unknown',
        email: referral.users?.[0]?.email,
        date: referral.created_at,
        status: referral.status,
        reward: referral.reward_granted ? '50MB' : 'Pending'
      }));
      setReferrals(mappedData);
    }
    loadReferrals();
  }, [user]);

  const shareViaWhatsApp = (referralCode: string, referralLink: string) => {
    const whatsappUrl = `https://wa.me/?text=Join%20Rafiki%20Rewards%20and%20get%20free%20data!%20Use%20my%20referral%20code:%20${referralCode}%20or%20sign%20up%20here:%20${encodeURIComponent(referralLink)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaFacebook = (referralCode: string, referralLink: string) => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=Join%20Rafiki%20Rewards%20and%20get%20free%20data!%20Use%20my%20referral%20code:%20${referralCode}`;
    window.open(facebookUrl, '_blank');
  };

  const shareViaTwitter = (referralCode: string, referralLink: string) => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=Join%20Rafiki%20Rewards%20and%20get%20free%20data!%20Use%20my%20referral%20code:%20${referralCode}&url=${encodeURIComponent(referralLink)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareViaEmail = (referralCode: string, referralLink: string) => {
    const emailSubject = "Join Rafiki Rewards and get free data!";
    const emailBody = `Hi there,\n\nI thought you might be interested in Rafiki Rewards. You can earn free data by completing simple tasks and referring friends.\n\nUse my referral code: ${referralCode} or sign up here: ${referralLink}\n\nCheers!`;
    window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <ReferralStats />

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
              {referrals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No referrals yet. Start sharing your referral link to earn rewards!
                  </TableCell>
                </TableRow>
              ) : (
                referrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell className="font-medium">{referral.name}</TableCell>
                    <TableCell>{formatDate(referral.date)}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        referral.status === 'completed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {referral.status === 'completed' ? 'Completed' : 'Pending'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{referral.reward}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}