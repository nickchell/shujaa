// This file provides helper functions to verify referral flow
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';
import { config } from '@/lib/config';

/**
 * Verifies that a referral was properly saved to the database
 * Used for testing and debugging the referral system
 */
export async function verifyReferralSaved(userId, referralCode) {
  if (!userId || !referralCode) {
    console.error("Missing userId or referralCode for verification");
    return false;
  }
  
  try {
    // Check if the user exists in the database
    const userResponse = await fetch(`/api/users/check?userId=${userId}`);
    const userData = await userResponse.json();
    
    if (!userData.exists) {
      console.error("User does not exist in Supabase:", userId);
      return false;
    }
    
    console.log("User exists in Supabase:", userData);
    
    // The referral code in the database might have been standardized to the proper prefix
    // So we need to check for potential matches
    let possibleMatches = [referralCode];
    const prefix = config.referralCodePrefix;
    
    // If it doesn't have the right prefix, add a version with it
    if (!referralCode.startsWith(prefix)) {
      if (referralCode.includes('-')) {
        // It has some other prefix
        possibleMatches.push(prefix + referralCode.split('-')[1]);
      } else {
        // No prefix at all
        possibleMatches.push(prefix + referralCode);
      }
    }
    
    // Check if the stored referred_by matches any of our possible formats
    const matchFound = possibleMatches.some(match => 
      userData.referred_by === match
    );
    
    if (matchFound) {
      console.log("✅ User was correctly saved with referral code:", userData.referred_by);
      return true;
    } else if (userData.referred_by) {
      console.log("⚠️ User has a different referral code:", userData.referred_by, 
        "instead of any of", possibleMatches);
      return false;
    } else {
      console.log("❌ User has no referral code saved");
      return false;
    }
  } catch (error) {
    console.error("Error verifying referral:", error);
    return false;
  }
}

/**
 * Helper to check if a referral code is valid before using it
 */
export async function validateReferralCode(code) {
  if (!code) return false;
  
  try {
    // Using the singleton supabase instance
    const prefix = config.referralCodePrefix;
    
    // First try the exact code
    let { data } = await supabase
      .from('users')
      .select('referral_code')
      .eq('referral_code', code)
      .maybeSingle();
      
    // If not found, try with standardized version
    if (!data) {
      let standardizedCode = code;
      if (!code.startsWith(prefix)) {
        if (code.includes('-')) {
          standardizedCode = prefix + code.split('-')[1];
        } else {
          standardizedCode = prefix + code;
        }
      }
      
      const { data: standardResult } = await supabase
        .from('users')
        .select('referral_code')
        .eq('referral_code', standardizedCode)
        .maybeSingle();
        
      data = standardResult;
    }
    
    return data ? true : false;
  } catch (error) {
    console.error("Error validating referral code:", error);
    return false;
  }
}

/**
 * Component to help debug the referral flow 
 */
export function DebugReferral() {
  const { toast } = useToast();
  
  // Log the steps of the referral process
  const checkReferralFlow = () => {
    const referralCode = localStorage.getItem('referralCode') || sessionStorage.getItem('referralCode');
    console.log("Referral Debug Checklist:");
    console.log("1. Is referral code in storage?", referralCode ? `✅ Yes: ${referralCode}` : "❌ No");
    console.log("2. Is localStorage used for storage?", localStorage.getItem('referralCode') ? "✅ Yes" : "❌ No");
    console.log("3. Is sessionStorage used for storage?", sessionStorage.getItem('referralCode') ? "✅ Yes" : "❌ No");
    
    if (referralCode) {
      // Validate the code
      validateReferralCode(referralCode).then(isValid => {
        console.log("4. Is the referral code valid?", isValid ? "✅ Yes" : "❌ No");
        
        toast({
          title: isValid ? "Valid Referral Code" : "Invalid Referral Code",
          description: `Code: ${referralCode} is ${isValid ? 'valid' : 'invalid'}`,
          variant: isValid ? "default" : "destructive"
        });
      });
    } else {
      toast({
        title: "No Referral Code",
        description: "No referral code found in storage",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={checkReferralFlow}
        className="bg-gray-800 text-white px-3 py-1 rounded-md text-xs"
      >
        Debug Referral
      </button>
    </div>
  );
} 