'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Referral {
  id: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  reward_granted: boolean;
  reward_type: string;
  reward_amount: number;
  referred_user?: {
    id: string;
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
    phone_number: string | null;
    created_at: string;
  };
};

type Stats = {
  total: number;
  pending: number;
  completed: number;
};

type ApiResponse = {
  data?: {
    referrals: Referral[];
    stats: Stats;
  };
  error?: string;
};

export function ReferralList() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/referrals/list', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch referrals');
        }
        
        const result: ApiResponse = await response.json();
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        if (result.data) {
          setReferrals(result.data.referrals || []);
          setStats(result.data.stats || { total: 0, pending: 0, completed: 0 });
        }
      } catch (err) {
        console.error('Error loading referrals:', err);
        setError(err instanceof Error ? err.message : 'Failed to load referrals');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Referrals</CardTitle>
          <CardDescription>Loading referrals...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Referrals</CardTitle>
          <CardDescription>Error loading referrals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 p-4 rounded-md bg-red-50">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total people you've referred</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20m-8-8h16" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Pending signups</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <path d="M22 4 12 14.01l-3-3" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Completed signups</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Referrals</CardTitle>
          <CardDescription>People you've recently referred</CardDescription>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No referrals found. Share your referral link to invite friends!
            </div>
          ) : (
            <div className="space-y-4">
              {referrals.map((referral) => {
                const email = referral.referred_user?.email || 'unknown@example.com';
                const name = referral.referred_user?.first_name && referral.referred_user?.last_name
                  ? `${referral.referred_user.first_name} ${referral.referred_user.last_name}`
                  : email.split('@')[0];
                  
                return (
                  <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={referral.referred_user?.avatar_url || ''} />
                        <AvatarFallback>
                          {email?.charAt(0).toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="font-medium">{name}</p>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>{email}</div>
                          <div>Friend since: {new Date(referral.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge
                        variant={referral.status === 'completed' ? 'default' : 'outline'}
                        className={`whitespace-nowrap ${
                          referral.status === 'completed' 
                            ? 'bg-green-500 hover:bg-green-600 text-white border-green-600' 
                            : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-200'
                        }`}
                      >
                        {referral.status === 'completed' 
                          ? '✓ Verified' 
                          : 'Pending'}
                      </Badge>
                      {referral.status === 'pending' && (
                        <span className="text-xs text-muted-foreground">
                          Ask friend to verify
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
