import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { createAdminClient } from '@/app/lib/supabase/server-utils';
import { auth } from '@clerk/nextjs';

export async function getReferralListData() {
  const { userId } = await auth();
  
  if (!userId) {
    return {
      error: 'Not authenticated',
      referrals: null,
      stats: null
    };
  }

  const supabase = createAdminClient();
  
  if (!supabase) {
    return {
      error: 'Failed to connect to database',
      referrals: null,
      stats: null
    };
  }

  // Get referrals
  const { data: referrals, error: referralsError } = await supabase
    .from('referrals')
    .select(`
      id,
      referrer_id,
      referred_id,
      status,
      created_at,
      reward_granted,
      reward_type,
      reward_amount,
      completed_at,
      referred_user:users!referrals_referred_id_fkey (
        id,
        full_name,
        email,
        avatar_url,
        phone_number,
        created_at
      )
    `)
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false });

  if (referralsError) {
    console.error('Error loading referrals:', referralsError);
    return {
      error: 'Failed to load referrals',
      referrals: null,
      stats: null
    };
  }

  // Get stats
  const { data: statsData } = await supabase
    .from('referrals')
    .select('status')
    .eq('referrer_id', userId)
    .in('status', ['pending', 'completed']);

  const pending = statsData?.filter(r => r.status === 'pending').length || 0;
  const completed = statsData?.filter(r => r.status === 'completed').length || 0;
  const stats = {
    total: pending + completed,
    pending,
    completed
  };

  return {
    error: null,
    referrals,
    stats
  };
}
