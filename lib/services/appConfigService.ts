import { supabase } from '@/lib/supabase';

type ReferralConfig = {
  baseUrl: string;
  referralPath: string;
  appName?: string;
  referralCodePrefix?: string;
};

type AppConfigValue = ReferralConfig | Record<string, any>;

export async function getAppConfig<T = AppConfigValue>(key: string): Promise<T | null> {
  if (!supabase) {
    console.error('Supabase client is not initialized');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', key)
      .single();

    if (error || !data) {
      console.error(`Error getting app config for key ${key}:`, error);
      return null;
    }

    return data.value as T;
  } catch (error) {
    console.error(`Unexpected error in getAppConfig for key ${key}:`, error);
    return null;
  }
}

export const setAppConfig = async (key: string, value: AppConfigValue, description?: string): Promise<boolean> => {
  if (!supabase) {
    console.error('Supabase client is not initialized');
    return false;
  }

  try {
    const { error } = await supabase
      .from('app_config')
      .upsert({
        key,
        value,
        description: description || `Updated at ${new Date().toISOString()}`,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      });

    if (error) {
      console.error(`Error setting app config for key ${key}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Unexpected error in setAppConfig for key ${key}:`, error);
    return false;
  }
}

// Helper function to get referral config
export const getReferralConfig = async (): Promise<ReferralConfig | null> => {
  if (!supabase) {
    console.error('Supabase client is not initialized');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', 'referral')
      .single();
      
    if (error || !data) {
      console.error('Error getting referral config:', error);
      return null;
    }

    return data.value as ReferralConfig;
  } catch (error) {
    console.error('Unexpected error in getReferralConfig:', error);
    return null;
  }
}

// Helper function to update referral config
export const updateReferralConfig = async (config: Partial<ReferralConfig>): Promise<boolean> => {
  if (!supabase) {
    console.error('Supabase client is not initialized');
    return false;
  }

  try {
    // First get the current config to merge with updates
    const currentConfig = await getReferralConfig();
    
    const updatedConfig = {
      ...(currentConfig || {}),
      ...config,
      updated_at: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('app_config')
      .upsert({
        key: 'referral',
        value: updatedConfig,
        description: 'Referral URL configuration including base URL and path',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      });

    if (error) {
      console.error('Error updating referral config:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in updateReferralConfig:', error);
    return false;
  }
}
