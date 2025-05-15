import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/types';

export type Referral = Database['public']['Tables']['referrals']['Row'] & {
  users: {
    full_name: string;
    email: string;
  }[];
};

export interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalRewards: number;
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

export async function getReferralCode(userId: string): Promise<string> {
  try {
    console.log('Fetching referral code for user ID:', userId);
    
    // Add a custom header to help with debugging
    const headers = new Headers();
    headers.append('X-Client-Request', 'true');
    
    const response = await fetch(`/api/referrals/code?userId=${userId}`, {
      headers,
      // Include credentials to send cookies/auth info
      credentials: 'include'
    });
    
    // Debug response status
    console.log('API response status:', response.status);
    
    // Check if response is OK before trying to parse JSON
    if (!response.ok) {
      console.error('API response not OK:', response.status, response.statusText);
      // Fall back to direct Supabase access instead of throwing error
      console.log('Falling back to direct Supabase access');
      
      // Direct Supabase access if API fails
      const supabase = createBrowserClient();
      const { data: user, error } = await supabase
        .from('users')
        .select('referral_code')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Supabase fallback error:', error);
        throw new Error('Failed to get referral code from database');
      }
      
      if (!user || !user.referral_code) {
        const fallbackCode = `rafiki-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        console.log('Generated fallback code:', fallbackCode);
        
        // Try to save the fallback code
        await supabase
          .from('users')
          .update({ referral_code: fallbackCode })
          .eq('id', userId);
          
        return fallbackCode;
      }
      
      // If there's a shuj- prefix, convert it to rafiki-
      if (user.referral_code.startsWith('shuj-')) {
        const parts = user.referral_code.split('-');
        if (parts.length > 1) {
          const newCode = `rafiki-${parts[1]}`;
          
          // Update with the new rafiki- prefix
          await supabase
            .from('users')
            .update({ referral_code: newCode })
            .eq('id', userId);
            
          return newCode;
        }
      }
      
      return user.referral_code;
    }
    
    try {
      const data = await response.json();
      console.log('API response data:', data);

      if (!data.code) {
        console.error('No referral code returned from API');
        throw new Error('No referral code returned');
      }
      
      return data.code;
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      // Same fallback logic as the 'not OK' response case
      console.log('Falling back to direct Supabase access');
      
      // Fallback to direct Supabase access if API fails
      const supabase = createBrowserClient();
      const { data: user, error } = await supabase
        .from('users')
        .select('referral_code')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Supabase fallback error:', error);
        throw new Error('Failed to get referral code from database');
      }
      
      if (!user || !user.referral_code) {
        const fallbackCode = `rafiki-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        console.log('Generated fallback code:', fallbackCode);
        
        // Try to save the fallback code
        await supabase
          .from('users')
          .update({ referral_code: fallbackCode })
          .eq('id', userId);
          
        return fallbackCode;
      }
      
      // If there's a shuj- prefix, convert it to rafiki-
      if (user.referral_code.startsWith('shuj-')) {
        const parts = user.referral_code.split('-');
        if (parts.length > 1) {
          const newCode = `rafiki-${parts[1]}`;
          
          // Update with the new rafiki- prefix
          await supabase
            .from('users')
            .update({ referral_code: newCode })
            .eq('id', userId);
            
          return newCode;
        }
      }
      
      return user.referral_code;
    }
  } catch (error) {
    console.error('Exception in getReferralCode:', error);
    throw error; // Let the component handle the error
  }
}

export async function getReferralStats(userId: string): Promise<ReferralStats> {
  const supabase = createBrowserClient();
  
  try {
    // First, get the user's referral code
    const { data: user } = await supabase
      .from('users')
      .select('referral_code')
      .eq('id', userId)
      .single();

    if (!user || !user.referral_code) {
      return {
        totalReferrals: 0,
        completedReferrals: 0,
        pendingReferrals: 0,
        totalRewards: 0
      };
    }

    // Get all users who were referred by this user's referral code
    const { data: referredUsers, error } = await supabase
      .from('users')
      .select('id, created_at, phone_number_verified')
      .eq('referred_by', user.referral_code);

    if (error) throw error;

    const referrals = referredUsers || [];
    const completedReferrals = referrals.filter(user => user.phone_number_verified).length;
    const pendingReferrals = referrals.length - completedReferrals;
    
    // Calculate total rewards (assuming 50MB per completed referral)
    const totalRewards = completedReferrals * 50;
    
    return {
      totalReferrals: referrals.length,
      completedReferrals,
      pendingReferrals,
      totalRewards
    };
  } catch (error) {
    console.error('Error getting referral stats:', error);
    return {
      totalReferrals: 0,
      completedReferrals: 0,
      pendingReferrals: 0,
      totalRewards: 0
    };
  }
}

export async function getReferrals(userId: string) {
  const supabase = createBrowserClient();
  
  try {
    // First, get the user's referral code
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('referral_code')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      throw userError;
    }

    if (!user || !user.referral_code) {
      console.log('No referral code found for user:', userId);
      return [];
    }

    console.log('Fetching users referred by code:', user.referral_code);
    
    // Get all users who were referred by this user's referral code
    const { data: referredUsers, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        phone_number,
        phone_number_verified,
        created_at
      `)
      .eq('referred_by', user.referral_code)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching referred users:', error);
      throw error;
    }

    console.log('Found referred users:', referredUsers);

    // Map to the expected referral format
    return (referredUsers || []).map(user => ({
      id: user.id,
      status: user.phone_number_verified ? 'completed' : 'pending',
      created_at: user.created_at,
      referred_user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        phone_number_verified: user.phone_number_verified
      }
    }));
  } catch (error) {
    console.error('Error getting referrals:', error);
    return [];
  }
}

export async function validateReferral(code: string, userId: string) {
  try {
    const response = await fetch(`/api/referrals/validate?code=${code}&userId=${userId}`);
    const data = await response.json();

    if (!response.ok) {
      console.error('Error validating referral:', data.error);
      return false;
    }

    return data.valid;
  } catch (error) {
    console.error('Error validating referral:', error);
    return false;
  }
}

export async function createReferral(referrerId: string, referredId: string) {
  try {
    const response = await fetch('/api/referrals/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ referrerId, referredId }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error creating referral:', data.error);
      throw new Error(data.error || 'Failed to create referral');
    }

    return data.referral;
  } catch (error) {
    console.error('Error creating referral:', error);
    throw error;
  }
}

export async function checkReferralCode(code: string) {
  const supabase = createBrowserClient();
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('referral_code', code)
      .maybeSingle();

    if (error) throw error;
    return data?.id || null;
  } catch (error) {
    console.error('Error checking referral code:', error);
    return null;
  }
}

export async function updateReferralStatus(referralId: string, status: 'pending' | 'completed' | 'rejected') {
  try {
    const response = await fetch('/api/referrals/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ referralId, status }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error updating referral status:', data.error);
      throw new Error(data.error || 'Failed to update referral status');
    }

    return data.referral;
  } catch (error) {
    return null;
  }
}

// Helper function to generate a random referral code
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const codeLength = 8;
  let code = '';
  
  for (let i = 0; i < codeLength; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }
  
  return code;
}

export async function getCurrentTier(userId: string): Promise<ReferralTier> {
  try {
    const stats = await getReferralStats(userId);
    const completedReferrals = stats.completedReferrals;

    // Find the highest tier the user qualifies for
    for (let i = REFERRAL_TIERS.length - 1; i >= 0; i--) {
      if (completedReferrals >= REFERRAL_TIERS[i].min_referrals) {
        return REFERRAL_TIERS[i];
      }
    }

    // Return the lowest tier if none match
    return REFERRAL_TIERS[0];
  } catch (error) {
    console.error('Error getting current tier:', error);
    return REFERRAL_TIERS[0];
  }
}

export async function getNextTier(userId: string): Promise<ReferralTier | null> {
  const currentTier = await getCurrentTier(userId);
  const currentTierIndex = REFERRAL_TIERS.findIndex(tier => tier.level === currentTier.level);
  
  if (currentTierIndex < REFERRAL_TIERS.length - 1) {
    return REFERRAL_TIERS[currentTierIndex + 1];
  }
  
  return null; // User is at the highest tier
}

export async function getReferralProgress(userId: string) {
  try {
    const stats = await getReferralStats(userId);
    const currentTier = await getCurrentTier(userId);
    const nextTier = await getNextTier(userId);
    
    if (!nextTier) {
      // User is at the highest tier
      return {
        current: currentTier,
        next: null,
        progress: 100,
        remaining: 0
      };
    }
    
    const completedReferrals = stats.completedReferrals;
    const requiredForNext = nextTier.min_referrals;
    const requiredForCurrent = currentTier.min_referrals;
    
    const totalRequired = requiredForNext - requiredForCurrent;
    const completed = completedReferrals - requiredForCurrent;
    
    const progress = Math.min(Math.round((completed / totalRequired) * 100), 100);
    const remaining = Math.max(requiredForNext - completedReferrals, 0);
    
    return {
      current: currentTier,
      next: nextTier,
      progress,
      remaining
    };
  } catch (error) {
    console.error('Error getting referral progress:', error);
    return {
      current: REFERRAL_TIERS[0],
      next: REFERRAL_TIERS[1],
      progress: 0,
      remaining: REFERRAL_TIERS[1].min_referrals
    };
  }
}

export async function resetReferralStats(userId: string) {
  try {
    const response = await fetch('/api/referrals/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error resetting referral stats:', data.error);
      throw new Error(data.error || 'Failed to reset referral stats');
    }

    return true;
  } catch (error) {
    console.error('Error resetting referral stats:', error);
    throw error;
  }
} 