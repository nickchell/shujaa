import { supabase } from '@/lib/supabase';

interface ReferredUser {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  created_at: string;
}

interface Referral {
  id: string;
  status: 'pending' | 'completed';
  created_at: string;
  referred_user: ReferredUser;
}

interface UserRecord {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export const getUserReferrals = async (userId: string): Promise<Referral[]> => {
  console.log('[ReferralService] Fetching referrals for user:', userId);
  
  if (!supabase) {
    throw new Error('Failed to initialize Supabase client');
  }

  // Get the user's referral code
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('referral_code')
    .eq('id', userId)
    .single();

  if (userError || !user?.referral_code) {
    console.error('[ReferralService] Error fetching user or no referral code:', userError);
    return [];
  }

  // Get all users who were referred by this user's referral code
  const { data: referredUsers, error } = await supabase
    .from('users')
    .select(`
      id,
      email,
      full_name,
      avatar_url,
      phone_number,
      created_at
    `)
    .eq('referred_by', user.referral_code)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[ReferralService] Error fetching referred users:', error);
    throw error;
  }

  console.log('[ReferralService] Found referred users:', referredUsers?.length || 0);

  // Map to the expected referral format
  return (referredUsers || []).map((user) => {
    const userRecord = user as UserRecord & { phone_number?: string };
    // If phone number exists, mark as completed, otherwise pending
    const status = userRecord.phone_number ? 'completed' : 'pending';
    
    return {
      id: userRecord.id,
      status,
      created_at: userRecord.created_at,
      referred_user: {
        id: userRecord.id,
        full_name: userRecord.full_name,
        email: userRecord.email,
        avatar_url: userRecord.avatar_url,
        phone_number: userRecord.phone_number || null,
        created_at: userRecord.created_at
      }
    } as Referral;
  });
}

interface ReferralStatsResponse {
  total: number;
  pending: number;
  completed: number;
}

interface ReferredUserStats {
  id: string;
  created_at: string;
}

export const getReferralStats = async (userId: string): Promise<ReferralStatsResponse> => {
  
  if (!supabase) {
    throw new Error('Failed to initialize Supabase client');
  }

  // Get the user's referral code
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('referral_code')
    .eq('id', userId)
    .single();

  if (userError || !user?.referral_code) {
    console.error('Error fetching user or no referral code:', userError);
    return { total: 0, pending: 0, completed: 0 };
  }

  // Get all users who were referred by this user's referral code
  const { data: referredUsers, error } = await supabase
    .from('users')
    .select('id, created_at')
    .eq('referred_by', user.referral_code);

  if (error) {
    console.error('Error fetching referred users:', error);
    throw error;
  }

  const users = (referredUsers || []) as ReferredUserStats[];
  // For now, count all as pending since we don't have a verification status
  // You might want to update this based on your business logic
  const completed = 0;
  const pending = users.length - completed;

  return {
    total: users.length,
    pending,
    completed
  };
}
