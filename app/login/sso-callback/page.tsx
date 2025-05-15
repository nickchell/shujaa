'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

export default function SSOCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, userId, isSignedIn } = useAuth();
  const [status, setStatus] = useState('Processing login...');
  const [clientReady, setClientReady] = useState(false);
  const redirectUrl = searchParams.get('redirect_url') || '/dashboard';

  useEffect(() => {
    // Mark component as ready on client side
    setClientReady(true);
    
    // Log initial params for debugging
    console.log('SSO callback params:', {
      redirectUrl,
      isLoaded,
      isSignedIn
    });
  }, []);

  useEffect(() => {
    // Check if authentication is completed
    if (isLoaded) {
      if (isSignedIn) {
        // User is authenticated, redirect to dashboard
        setStatus('Authentication successful, redirecting...');
        console.log('User is signed in, redirecting to', redirectUrl);
        
        // Use a slight delay to allow Clerk to fully initialize
        setTimeout(() => {
          router.push(redirectUrl);
        }, 1000);
      } else {
        // Still waiting for authentication to complete
        console.log('Waiting for authentication to complete...');
        setStatus('Finalizing your login...');
      }
    }
  }, [isLoaded, isSignedIn, router, redirectUrl]);
  
  // Show consistent loading UI while processing
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Processing Login</h2>
        <p className="mb-4">{status}</p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
} 