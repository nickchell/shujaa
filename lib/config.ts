import { env } from './env';
import { getReferralConfig, updateReferralConfig } from './services/appConfigService';

// Define the shape of our configuration
type AppConfig = {
  baseUrl: string;
  referralPath: string;
  appName: string;
  referralCodePrefix: string;
};

// Default values if config service is not available
const DEFAULT_CONFIG: AppConfig = {
  baseUrl: 'https://england-bowling-lemon-penguin.trycloudflare.com',
  referralPath: '/welcome',
  appName: 'Rafiki Rewards',
  referralCodePrefix: 'rafiki-'
};

// This will be populated at runtime
let dynamicConfig: AppConfig = { ...DEFAULT_CONFIG };

// Track initialization state
let isInitialized = false;

// Initialize the configuration
async function initializeConfig() {
  // Prevent multiple initializations
  if (isInitialized) {
    console.log('Configuration already initialized');
    return;
  }

  try {
    const referralConfig = await getReferralConfig();
    if (referralConfig) {
      dynamicConfig = {
        ...DEFAULT_CONFIG,
        ...referralConfig
      };
    }
    console.log('Configuration initialized:', dynamicConfig);
  } catch (error) {
    console.error('Error initializing config, using defaults:', error);
  } finally {
    isInitialized = true;
  }
}

// Updates the configuration with new values
async function updateConfig(updates: Partial<AppConfig>): Promise<boolean> {
  try {
    if (updates.baseUrl || updates.referralPath) {
      // If we're updating URL-related config, update the database
      const success = await updateReferralConfig({
        baseUrl: updates.baseUrl || dynamicConfig.baseUrl,
        referralPath: updates.referralPath || dynamicConfig.referralPath
      });
      
      if (!success) {
        console.error('Failed to update referral config in database');
        return false;
      }
    }
    
    // Update the in-memory config
    dynamicConfig = {
      ...dynamicConfig,
      ...updates
    };
    
    console.log('Configuration updated:', dynamicConfig);
    return true;
  } catch (error) {
    console.error('Error updating config:', error);
    return false;
  }
}

// Export the config object with all its methods
export const config = {
  initializeConfig,
  updateConfig,
  
  /**
   * Base URL used for generating referral links
   */
  get baseUrl(): string {
    if (!isInitialized) {
      console.warn('Config not initialized, using default values');
      return DEFAULT_CONFIG.baseUrl;
    }
    return dynamicConfig.baseUrl;
  },
  
  /**
   * Path for the welcome page where users land when using a referral link
   */
  get referralPath(): string {
    if (!isInitialized) {
      console.warn('Config not initialized, using default values');
      return DEFAULT_CONFIG.referralPath;
    }
    return dynamicConfig.referralPath;
  },
  
  /**
   * Full URL for the welcome page where users land when using a referral link
   */
  get referralUrl(): string {
    const base = this.baseUrl.replace(/\/$/, '');
    const path = this.referralPath.startsWith('/') ? this.referralPath : `/${this.referralPath}`;
    return `${base}${path}`;
  },
  
  /**
   * Application name
   */
  get appName(): string {
    if (!isInitialized) {
      console.warn('Config not initialized, using default values');
      return DEFAULT_CONFIG.appName;
    }
    return dynamicConfig.appName;
  },
  
  /**
   * Referral code prefix
   */
  get referralCodePrefix(): string {
    if (!isInitialized) {
      console.warn('Config not initialized, using default values');
      return DEFAULT_CONFIG.referralCodePrefix;
    }
    return dynamicConfig.referralCodePrefix;
  },
  
  /**
   * Generates a full referral URL with the given code
   */
  generateReferralUrl(code: string): string {
    const url = this.referralUrl;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}ref=${encodeURIComponent(code)}`;
  },
  
  /**
   * Extracts the referral code from a URL
   */
  extractReferralCode(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const ref = urlObj.searchParams.get('ref');
      return ref ? decodeURIComponent(ref) : null;
    } catch (error) {
      console.error('Error extracting referral code:', error);
      return null;
    }
  }
};