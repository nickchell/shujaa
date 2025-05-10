import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  created_at: string;
  reward_granted: boolean;
  reward_type?: string;
  reward_amount?: number;
  status: 'pending' | 'completed' | 'invalid';
  completed_at?: string;
}

export interface ReferralStats {
  total: number;
  completed: number;
  pending: number;
  total_rewards: number;
  lastUpdated: string;
}

export interface ReferralTier {
  level: number;
  min_referrals: number;
  reward_amount: number;
  description: string;
}

export const REFERRAL_TIERS: ReferralTier[] = [
  { level: 1, min_referrals: 0, reward_amount: 50, description: '50MB per referral' },
  { level: 2, min_referrals: 10, reward_amount: 75, description: '75MB per referral' },
  { level: 3, min_referrals: 25, reward_amount: 100, description: '100MB per referral' }
];

export async function getReferralCode(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('users')
    .select('referral_code')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching referral code:', error);
    return null;
  }

  return data?.referral_code || null;
}

export async function getReferralStats(userId: string): Promise<ReferralStats> {
  const { data, error } = await supabase
    .from('referral_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching referral stats:', error);
    return {
      total: 0,
      completed: 0,
      pending: 0,
      total_rewards: 0,
      lastUpdated: new Date().toISOString()
    };
  }

  return {
    total: data?.total_referrals || 0,
    completed: data?.completed_referrals || 0,
    pending: data?.pending_referrals || 0,
    total_rewards: data?.total_rewards || 0,
    lastUpdated: data?.last_updated || new Date().toISOString()
  };
}

export async function getReferrals(userId: string) {
  const supabase = createClient();
  
  try {
    // First ensure the user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return [];
    }

    // Then fetch referrals
    const { data, error } = await supabase
      .from('referrals')
      .select(`
        id,
        referred_id,
        status,
        reward_granted,
        created_at,
        users:referred_id (
          id,
          full_name,
          email
        )
      `)
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching referrals:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getReferrals:', error);
    return [];
  }
}

export async function validateReferral(referralId: string) {
  const { data, error } = await supabase
    .from('referrals')
    .update({ 
      status: 'completed',
      reward_granted: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', referralId)
    .select()
    .single();

  if (error) {
    console.error('Error validating referral:', error);
    return null;
  }

  return data;
}

export async function createReferral(referrerId: string, referredId: string) {
  const { data, error } = await supabase
    .from('referrals')
    .insert({
      referrer_id: referrerId,
      referred_id: referredId,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating referral:', error);
    return null;
  }

  return data;
}

export async function checkReferralCode(code: string) {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('referral_code', code)
    .single();

  if (error) {
    console.error('Error checking referral code:', error);
    return null;
  }

  return data?.id || null;
}

export async function getCurrentTier(userId: string): Promise<ReferralTier> {
  const stats = await getReferralStats(userId);
  const completedReferrals = stats.completed;

  // Find the highest tier the user qualifies for
  const currentTier = REFERRAL_TIERS.reduce((highest, tier) => {
    if (completedReferrals >= tier.min_referrals && tier.level > highest.level) {
      return tier;
    }
    return highest;
  }, REFERRAL_TIERS[0]);

  return currentTier;
}

export async function getNextTier(userId: string): Promise<ReferralTier | null> {
  const currentTier = await getCurrentTier(userId);
  const nextTier = REFERRAL_TIERS.find(tier => tier.level === currentTier.level + 1);
  return nextTier || null;
}

export async function getReferralProgress(userId: string) {
  const stats = await getReferralStats(userId);
  const currentTier = await getCurrentTier(userId);
  const nextTier = await getNextTier(userId);

  return {
    currentTier,
    nextTier,
    progress: {
      current: stats.completed,
      next: nextTier?.min_referrals || currentTier.min_referrals,
      percentage: nextTier 
        ? (stats.completed / nextTier.min_referrals) * 100 
        : 100
    }
  };
}

export async function resetReferralStats(userId: string) {
  const { error } = await supabase
    .from('referral_stats')
    .update({
      total_referrals: 0,
      completed_referrals: 0,
      pending_referrals: 0,
      total_rewards: 0,
      last_updated: new Date().toISOString()
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error resetting referral stats:', error);
    return false;
  }

  return true;
}

export async function updateReferralStatus(
  referralId: string,
  status: 'completed' | 'failed',
  rewardType?: string,
  rewardAmount?: number
): Promise<boolean> {
  const { error } = await supabase
    .from('referrals')
    .update({
      status,
      reward_granted: status === 'completed',
      reward_type: rewardType,
      reward_amount: rewardAmount,
      completed_at: status === 'completed' ? new Date().toISOString() : null
    })
    .eq('id', referralId);

  if (error) {
    console.error('Error updating referral status:', error);
    return false;
  }

  return true;
}

export async function getReferralByCode(code: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('referral_code', code)
    .single();

  if (error) {
    console.error('Error fetching referral by code:', error);
    return null;
  }

  return data?.id || null;
} 