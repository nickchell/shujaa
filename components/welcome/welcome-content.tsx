'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createBrowserClient } from '@/lib/supabase/browser-client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { config } from '@/lib/config';
import { checkReferralCodeExists } from '@/lib/supabase/db-utils';
import { PhoneInput } from '@/components/dashboard/phone-input';

export default function WelcomeContent() {
  const searchParams = useSearchParams();
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [standardizedCode, setStandardizedCode] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const rawReferralCode = searchParams.get('ref');

  // Standardize the referral code format to ensure it uses the correct prefix
  useEffect(() => {
    // Ensure config is initialized
    if (!isInitialized) {
      config.initializeConfig().then(() => {
        console.log('Config initialized with prefix:', config.referralCodePrefix);
        setIsInitialized(true);
      });
    }
    if (!rawReferralCode) {
      setStandardizedCode(null);
      return;
    }

    let code = rawReferralCode;
    const prefix = config.referralCodePrefix; // Access the getter property
    
    // Ensure the code has the correct prefix
    if (!code.startsWith(prefix)) {
      // If it has another prefix, extract the code part
      if (code.includes('-')) {
        const parts = code.split('-');
        // Take the last part in case there are multiple hyphens
        code = prefix + parts[parts.length - 1];
      } else {
        // If no prefix, add one
        code = prefix + code;
      }
    }
    
    // Clean up the code (remove any URL parts if present)
    code = code.split('?')[0].split('#')[0].trim();
    
    console.log(`Standardized referral code from ${rawReferralCode} to ${code}`);
    setStandardizedCode(code);
    
    // Store in both localStorage and sessionStorage for redundancy
    localStorage.setItem('referralCode', code);
    sessionStorage.setItem('referralCode', code);
    console.log('✅ Referral code saved to storage:', code);
    
  }, [rawReferralCode, isInitialized]);

  // Helper function to get the referrer's name from user data
  function getReferrerName(userData: any): string {
    if (!userData) return 'A friend';
    return userData.first_name || 'A friend';
  }
  
  // Add a debug button in development
  const isDev = process.env.NODE_ENV === 'development';
  
  const handleDebugClick = async () => {
    if (!standardizedCode) return;
    
    console.log('=== DEBUGGING REFERRAL CODE ===');
    console.log(`Code: ${standardizedCode}`);
    console.log('Checking database...');
    
    const result = await checkReferralCodeExists(standardizedCode);
    console.log('Database check result:', result);
    
    if (!result.exists) {
      console.log('Trying direct SQL query...');
      const supabase = createBrowserClient();
      const { data, error } = await supabase.rpc('check_referral_code', { code: standardizedCode });
      console.log('Direct SQL query result:', { data, error });
    }
  };

  // Fetch referrer details when standardizedCode changes
  useEffect(() => {
    const fetchReferrerDetails = async () => {
      if (!standardizedCode) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        console.log(`Looking up referral code: ${standardizedCode}`);
        
        // Use our new utility function to check the referral code
        const { exists, data: referrerData } = await checkReferralCodeExists(standardizedCode);
        
        if (!exists && rawReferralCode && rawReferralCode !== standardizedCode) {
          console.log(`Trying with raw referral code: ${rawReferralCode}`);
          const rawResult = await checkReferralCodeExists(rawReferralCode);
          if (rawResult.exists) {
            console.log('Found with raw referral code:', rawResult.data);
            const name = getReferrerName(rawResult.data);
            setReferrerName(name);
            setStandardizedCode(rawResult.data.referral_code);
            // Save to storage for later use
            localStorage.setItem('referralCode', rawResult.data.referral_code);
            sessionStorage.setItem('referralCode', rawResult.data.referral_code);
            setIsLoading(false);
            return;
          }
        }
        
        if (exists && referrerData) {
          console.log('Found referrer data:', referrerData);
          const name = getReferrerName(referrerData);
          setReferrerName(name);
          setStandardizedCode(referrerData.referral_code);
          // Save to storage for later use
          localStorage.setItem('referralCode', referrerData.referral_code);
          sessionStorage.setItem('referralCode', referrerData.referral_code);
        } else {
          console.warn('No referrer found for code:', standardizedCode);
          setReferrerName(null);
        }
      } catch (error) {
        console.error('Exception in fetchReferrerDetails:', error);
        // Silently fail and just show generic welcome
        setReferrerName(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferrerDetails();
  }, [standardizedCode, rawReferralCode]);

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <Card className="border-2 border-primary/20">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-[hsl(1,77%,55%)] to-[hsl(142,76%,36%)] bg-clip-text text-transparent">
            Welcome to Rafiki Rewards!
          </CardTitle>
          <CardDescription className="text-xl">
            {isLoading ? (
              'Loading referrer details...'
            ) : referrerName ? (
              <>
                <span className="font-semibold text-[hsl(1,77%,55%)]">{referrerName}</span> has invited you to join Rafiki Rewards, where you can earn free data!
              </>
            ) : (
              'Join the most awesome rewards platform in Kenya and earn free data!'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 text-center">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Why Join Rafiki Rewards?</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>✨ Earn free Safaricom data bundles</li>
                <li>🎁 Get rewards for referring friends</li>
                <li>💎 Complete simple tasks for points</li>
                <li>🌟 Join thousands of Kenyans already earning free data</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 pt-4">
            <div className="w-full max-w-md mx-auto space-y-4">
              <PhoneInput />
              <Button asChild size="lg" className="w-full bg-gradient-to-r from-[hsl(1,77%,55%)] to-[hsl(142,76%,36%)] hover:opacity-90 animate-pulse-scale">
                <Link 
                  href={standardizedCode ? 
                    `${config.baseUrl}/signup?ref=${encodeURIComponent(standardizedCode)}` : 
                    `${config.baseUrl}/signup`} 
                  className="flex items-center justify-center gap-2"
                >
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            {isDev && (
              <button 
                onClick={handleDebugClick}
                className="text-xs text-gray-500 hover:underline mt-2"
                title="Debug referral code"
              >
                
              </button>
            )}
          </div>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">
              Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Sign in</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 