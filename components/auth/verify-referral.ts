import { supabase } from '@/lib/supabase/client';
import { config } from '@/lib/config';

/**
 * Validates if a referral code exists in the database
 * @param code - The referral code to validate
 * @returns Promise<boolean> - True if the code is valid
 */
export async function validateReferralCode(code: string): Promise<boolean> {
  try {
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
    
    // Check if the code exists in the database
    const { data, error } = await supabase
      .from('users')
      .select('referral_code')
      .eq('referral_code', standardizedCode)
      .maybeSingle();
      
    if (error) {
      console.error('Error validating referral code:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error in validateReferralCode:', error);
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
    
    // Check the user's referred_by field
    const { data, error } = await supabase
      .from('users')
      .select('referred_by')
      .eq('id', userId)
      .maybeSingle();
      
    if (error) {
      console.error('Error verifying referral saved:', error);
      return false;
    }
    
    // Verify the user has the expected referral code
    return data?.referred_by === standardizedCode;
  } catch (error) {
    console.error('Error in verifyReferralSaved:', error);
    return false;
  }
} 