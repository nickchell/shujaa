import { createBrowserClient } from '@/lib/supabase/browser-client';
import { config } from '@/lib/config';

/**
 * Validates if a referral code exists in the database
 * @param code - The referral code to validate
 * @returns Promise<boolean> - True if the code is valid
 */
export async function validateReferralCode(code: string): Promise<boolean> {
  try {
    const supabase = createBrowserClient();
    const prefix = config.referralCodePrefix;
    
    // Ensure the code has the correct prefix
    let standardizedCode = code;
    if (!standardizedCode.startsWith(prefix)) {
      if (standardizedCode.includes('-')) {
        standardizedCode = prefix + standardizedCode.split('-')[1];
      } else {
        standardizedCode = prefix + standardizedCode;
      }
    }
    
    console.log(`[validateReferralCode] Validating code: ${standardizedCode}`);
    
    // Log the standardized code for debugging
    console.log(`[validateReferralCode] Attempting to validate standardized code: ${standardizedCode}`);

    // Try to find any users with referral codes first (for debugging)
    const { data: sampleUsers, error: sampleError } = await supabase
      .from('users')
      .select('id, referral_code')
      .not('referral_code', 'is', null)
      .limit(5);

    if (sampleError) {
      console.error('[validateReferralCode] Error checking for referral codes:', sampleError);
    } else {
      console.log('[validateReferralCode] Sample users with referral codes:', 
        sampleUsers?.map(u => ({ id: u.id, code: u.referral_code })));
    }

    // First try exact match
    console.log(`[validateReferralCode] Running exact match query for: ${standardizedCode}`);
    const { data: exactMatch, error: exactError } = await supabase
      .from('users')
      .select('id, referral_code')
      .eq('referral_code', standardizedCode)
      .maybeSingle();

    if (exactError) {
      console.error('[validateReferralCode] Error in exact match:', exactError);
      return false;
    }

    if (exactMatch) {
      console.log(`[validateReferralCode] Found exact match:`, exactMatch);
      return true;
    }

    console.log('[validateReferralCode] No exact match, trying case-insensitive match...');
    
    // If no exact match, try case-insensitive search
    const { data: caseMatch, error: caseError } = await supabase
      .from('users')
      .select('id, referral_code')
      .ilike('referral_code', standardizedCode)
      .maybeSingle();

    if (caseError) {
      console.error('[validateReferralCode] Error in case-insensitive match:', caseError);
      return false;
    }

    if (caseMatch) {
      console.log(`[validateReferralCode] Found case-insensitive match:`, caseMatch);
      return true;
    }

    // Log available referral codes for debugging
    const { data: allCodes, error: codesError } = await supabase
      .from('users')
      .select('id, referral_code')
      .not('referral_code', 'is', null)
      .order('created_at', { ascending: false })
      .limit(10);

    if (codesError) {
      console.error('[validateReferralCode] Error fetching referral codes:', codesError);
    } else {
      console.log('[validateReferralCode] Recent referral codes:', 
        allCodes?.map(c => ({ id: c.id, code: c.referral_code })));
    }
    
    return false;
  } catch (error) {
    console.error('[validateReferralCode] Error in validateReferralCode:', error);
    return false;
  }
}

/**
 * Verifies that a user has a referral code saved in their profile
 * @param userId - The user's ID
 * @param expectedCode - The expected referral code
 * @returns Promise<boolean> - True if the user has the expected referral code
 */
export async function verifyReferralSaved(userId: string, expectedCode: string): Promise<boolean> {
  try {
    const supabase = createBrowserClient();
    const prefix = config.referralCodePrefix;
    
    // Ensure the expected code has the correct prefix
    let standardizedCode = expectedCode;
    if (!standardizedCode.startsWith(prefix)) {
      if (standardizedCode.includes('-')) {
        standardizedCode = prefix + standardizedCode.split('-')[1];
      } else {
        standardizedCode = prefix + standardizedCode;
      }
    }
    
    console.log(`[verifyReferralSaved] Verifying referral for user ${userId}, code: ${standardizedCode}`);
    
    // Check the user's referred_by field
    const { data, error } = await supabase
      .from('users')
      .select('referred_by')
      .eq('id', userId)
      .maybeSingle();
      
    if (error) {
      console.error('[verifyReferralSaved] Error fetching user data:', error);
      return false;
    }
    
    const hasReferral = data?.referred_by === standardizedCode;
    console.log(`[verifyReferralSaved] User ${userId} has referral ${standardizedCode}: ${hasReferral}`);
    
    if (!hasReferral) {
      console.log(`[verifyReferralSaved] User's referred_by: ${data?.referred_by}, expected: ${standardizedCode}`);
    }
    
    return hasReferral;
  } catch (error) {
    console.error('[verifyReferralSaved] Error in verifyReferralSaved:', error);
    return false;
  }
}
