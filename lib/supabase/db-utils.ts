import { supabase } from './client';
import { config } from '@/lib/config';

export async function checkReferralCodeExists(code: string): Promise<{ exists: boolean; data: any }> {
  try {
    const prefix = config.referralCodePrefix;
    
    // First try exact match
    let { data, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, referral_code')
      .eq('referral_code', code)
      .maybeSingle();
    
    if (data) {
      return { exists: true, data };
    }
    
    // Try case-insensitive match
    const { data: ciData } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, referral_code')
      .ilike('referral_code', code)
      .maybeSingle();
    
    if (ciData) {
      return { exists: true, data: ciData };
    }
    
    // Try with the code without prefix if it has one
    if (code.startsWith(prefix)) {
      const codeWithoutPrefix = code.substring(prefix.length);
      const { data: noPrefixData } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, referral_code')
        .or(`referral_code.eq.${codeWithoutPrefix},referral_code.ilike.${codeWithoutPrefix}`)
        .maybeSingle();
      
      if (noPrefixData) {
        return { exists: true, data: noPrefixData };
      }
    }
    
    return { exists: false, data: null };
  } catch (error) {
    console.error('Error checking referral code:', error);
    return { exists: false, data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
