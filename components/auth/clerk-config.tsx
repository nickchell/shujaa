'use client';

import { useEffect } from 'react';
import { useClerk } from '@clerk/nextjs';

// This component configures Clerk's client-side behavior
// It needs to be a client component to work properly
export function ClerkConfig() {
  const { setActive } = useClerk();

  useEffect(() => {
    // Configure special handling for SSO callbacks
    // The original URL may contain the clerk token for SSO
    if (window.location.href.includes('__clerk_db_jwt')) {
      console.log('Detected SSO callback URL, handling it properly');
      
      // Let Clerk handle the callback naturally
      // It will handle the session creation internally
      const callbackUrl = window.location.href;
      
      // Get the redirect URL from search params if any
      const searchParams = new URLSearchParams(window.location.search);
      const redirectUrl = searchParams.get('redirect_url') || '/dashboard';
      
      try {
        // Don't need to manually call handleRedirectCallback here
        // Just logging to show it's being handled
        console.log('SSO callback being processed, will redirect to:', redirectUrl);
      } catch (error) {
        console.error('Error in SSO handling:', error);
      }
    }
  }, [setActive]);

  return null;
} 