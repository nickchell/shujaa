'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { validateReferral } from '@/lib/supabase/referrals';
import { useToast } from '@/hooks/use-toast';
import { verifyReferralSaved, validateReferralCode } from './verify-referral-new';
import { saveUserToSupabase } from '@/lib/supabase/save-user';
import { createBrowserClient } from '@/lib/supabase/browser-client';
import { config } from '@/lib/config';

// Simple error boundary component for client-side error handling
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error in ProcessReferral:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return null; // Silently fail in production
    }

    return this.props.children;
  }
}

// This component handles processing referral codes from localStorage/sessionStorage
// It's designed to run only on the client side
export function ProcessReferral() {
  const [isMounted, setIsMounted] = useState(false);
  const { user, isLoaded } = useUser();
  const supabase = createBrowserClient();
  const { toast } = useToast();
  const [processed, setProcessed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Ensure this only runs on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const processReferralCode = async () => {
      // Only run on client, when user is loaded, and not yet processed
      if (!isMounted || !isLoaded || !user || processed || isProcessing) {
        return;
      }

      try {
        setIsProcessing(true);
        
        // Safely access browser storage
        let rawReferralCode = '';
        try {
          rawReferralCode = window.localStorage?.getItem('referralCode') || 
                          window.sessionStorage?.getItem('referralCode') || '';
          console.log('[ProcessReferral] Raw referral code from storage:', rawReferralCode);
        } catch (storageError) {
          console.error('Error accessing storage:', storageError);
          setIsProcessing(false);
          setProcessed(true);
          return;
        }

        if (!rawReferralCode) {
          console.log('No referral code found in storage');
          setIsProcessing(false);
          setProcessed(true);
          return;
        }

        console.log(`[ProcessReferral] Processing referral code for user ${user.id}: ${rawReferralCode}`);
        
        // Standardize the referral code to ensure it has the rafiki- prefix
        let standardizedCode = rawReferralCode;
        const prefix = config.referralCodePrefix;
        
        if (!standardizedCode.startsWith(prefix)) {
          if (standardizedCode.includes('-')) {
            standardizedCode = prefix + standardizedCode.split('-')[1];
          } else {
            standardizedCode = prefix + standardizedCode;
          }
          console.log(`[ProcessReferral] Standardized referral code from ${rawReferralCode} to ${standardizedCode}`);
        }
        
        // First, validate that the referral code actually exists in the database
        const isValid = await validateReferralCode(standardizedCode);
        
        if (!isValid) {
          console.log(`[ProcessReferral] ❌ Invalid referral code: ${standardizedCode} - referral won't be applied`);
          toast({
            title: "Invalid Referral Code",
            description: "The referral code provided is not valid.",
            variant: "destructive"
          });
          setIsProcessing(false);
          setProcessed(true);
          return;
        }

        // Save the user to Supabase with the referral code
        try {
          // Update user data in Supabase including the referral code
          await saveUserToSupabase({
            userId: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            imageUrl: user.imageUrl,
            referredBy: standardizedCode // Pass the standardized code
          });
          
          // Verify that the referral was saved correctly
          const verifyResult = await verifyReferralSaved(user.id, standardizedCode);
          
          if (verifyResult) {
            console.log(`[ProcessReferral] ✅ Referral ${standardizedCode} verified and saved successfully for user ${user.id}`);
            toast({
              title: "Referral Applied",
              description: "Your referral has been successfully applied to your account.",
            });
          } else {
            console.log(`[ProcessReferral] ⚠️ Referral verification failed for user ${user.id} - data may not be saved correctly`);
            toast({
              title: "Referral Processed",
              description: "Your referral has been received, but please contact support if rewards aren't applied.",
            });
          }
        } catch (error) {
          console.error('Error saving user with referral:', error);
          toast({
            title: "Error Processing Referral",
            description: "There was a problem applying your referral. Please try again later.",
            variant: "destructive"
          });
          setIsProcessing(false);
          setProcessed(true);
          return;
        }

        // Remove the referral code from both storage locations
        localStorage.removeItem('referralCode');
        sessionStorage.removeItem('referralCode');

        // Mark as processed to prevent duplicate processing
        setProcessed(true);
        setIsProcessing(false);

      } catch (error) {
        console.error('Error processing referral:', error);
        toast({
          title: "Error Processing Referral",
          description: "There was a problem applying your referral. Please try again later.",
          variant: "destructive"
        });
        setIsProcessing(false);
      }
    };

    processReferralCode();
  }, [user, isLoaded, processed, isProcessing, toast, supabase, isMounted]);

  // This component doesn't render anything
  return (
    <ErrorBoundary>
      {null}
    </ErrorBoundary>
  );
}