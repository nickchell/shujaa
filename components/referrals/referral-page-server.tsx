import { auth } from '@clerk/nextjs';
import { createAdminClient } from '@/app/lib/supabase/server-utils';
import { config } from '@/lib/config';

export async function getReferralData() {
  const { userId } = await auth();
  
  if (!userId) {
    return {
      error: 'Not authenticated',
      referralCode: null,
      referralLink: null
    };
  }

  const supabase = createAdminClient();
  
  if (!supabase) {
    return {
      error: 'Failed to connect to database',
      referralCode: null,
      referralLink: null
    };
  }

  // Get user's referral code from the users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('referral_code')
    .eq('id', userId)
    .single();

  if (userError || !userData) {
    console.error('Error loading user data:', userError);
    return {
      error: 'Failed to load user data',
      referralCode: null,
      referralLink: null
    };
  }

  const referralCode = userData.referral_code;
  // Generate the full referral URL using the config
  const referralLink = `${config.referralUrl}?ref=${encodeURIComponent(referralCode)}`;

  return {
    error: null,
    referralCode,
    referralLink
  };
}
