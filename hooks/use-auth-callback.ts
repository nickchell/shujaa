'use client';

import { useCallback } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { saveUserToSupabase } from '@/lib/user-service';

export function useAuthCallback() {
  const { userId, isLoaded: isAuthLoaded, getToken } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();

  const handleAuthCallback = useCallback(async () => {
    console.log('Auth callback triggered with state:', {
      isAuthLoaded,
      isUserLoaded,
      hasUserId: !!userId,
      hasUser: !!user,
      userId,
      userEmail: user?.emailAddresses[0]?.emailAddress
    });

    if (!isAuthLoaded || !isUserLoaded) {
      console.log('Auth or user not loaded yet, returning');
      return Promise.reject(new Error('Auth or user not loaded'));
    }

    if (!userId || !user) {
      console.log('No user data available, returning');
      return Promise.reject(new Error('No user data available'));
    }

    try {
      // Get the primary email address
      const primaryEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId);
      console.log('Found primary email:', primaryEmail);
      
      const userData = {
        id: userId,
        email: primaryEmail?.emailAddress || '',
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        avatarUrl: user.imageUrl,
        emailVerified: primaryEmail?.verification?.status === 'verified',
      };

      console.log('Prepared user data for Supabase:', userData);
      
      // Save user to Supabase
      await saveUserToSupabase(userData);
      console.log('Successfully saved user to Supabase');
      return true;
    } catch (error) {
      console.error('Failed to save user data:', error);
      return Promise.reject(error);
    }
  }, [userId, user, isAuthLoaded, isUserLoaded, getToken]);

  return handleAuthCallback;
} 