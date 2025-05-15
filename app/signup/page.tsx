'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SignUp, useAuth } from "@clerk/nextjs";
import { useLoading } from '@/components/providers/loading-provider';

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref');
  const router = useRouter();
  const { isLoaded, userId } = useAuth();
  const { isLoading } = useLoading();
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    // Mark component as ready on client side
    setClientReady(true);
    
    // Store the referral code in localStorage for retrieval after authentication
    if (referralCode) {
      localStorage.setItem('referralCode', referralCode);
      console.log('Stored referral code in localStorage:', referralCode);
      
      // Also store in sessionStorage as a fallback
      sessionStorage.setItem('referralCode', referralCode);
    }
  }, [referralCode]);

  useEffect(() => {
    // Check if the user is already authenticated and redirect to dashboard
    if (isLoaded && userId) {
      router.push('/dashboard');
    }
  }, [isLoaded, userId, router]);

  // Show loading state while initializing or redirecting
  if (isLoading || (isLoaded && userId) || !clientReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Loading</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Join Rafiki Rewards</h1>
          <p className="mt-2 text-sm text-gray-600">
            {referralCode 
              ? "Complete your registration to join through your friend's invitation" 
              : "Create an account to start earning rewards"}
          </p>
          {referralCode && (
            <p className="mt-1 text-xs text-blue-600">
              Referral code: {referralCode} will be applied automatically
            </p>
          )}
        </div>
        
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 
                "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
              card: "bg-transparent shadow-none",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: 
                "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
              formFieldInput: 
                "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6",
              footerActionLink: "text-blue-600 hover:text-blue-700",
            },
          }}
          afterSignUpUrl="/dashboard"
          routing="path"
          path="/signup"
          unsafeMetadata={referralCode ? { referredBy: referralCode } : undefined}
        />
      </div>
    </div>
  );
} 