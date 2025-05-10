'use client';

import { SignIn } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useAuthCallback } from '@/hooks/use-auth-callback';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface AuthState {
  isSignedIn: boolean;
  userId: string | null;
  hasUser: boolean;
}

export default function LoginPage() {
  const handleAuthCallback = useAuthCallback();
  const { isSignedIn, userId, isLoaded: isAuthLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [authState, setAuthState] = useState<AuthState>({
    isSignedIn: false,
    userId: null,
    hasUser: false
  });

  // Log auth state changes
  useEffect(() => {
    if (isAuthLoaded && isUserLoaded) {
      console.log('Auth state changed:', {
        isSignedIn,
        userId,
        hasUser: !!user,
        isAuthLoaded,
        isUserLoaded
      });
      setAuthState({
        isSignedIn: !!isSignedIn,
        userId: userId || null,
        hasUser: !!user
      });
    }
  }, [isSignedIn, userId, user, isAuthLoaded, isUserLoaded]);

  // Handle sign in
  useEffect(() => {
    if (!isAuthLoaded || !isUserLoaded) return;

    console.log('Checking sign in state:', authState);

    if (authState.isSignedIn && authState.userId && authState.hasUser) {
      console.log('User is signed in, calling auth callback');
      handleAuthCallback()
        .then(() => {
          console.log('Auth callback completed, redirecting to dashboard');
          router.push('/dashboard');
        })
        .catch((error) => {
          console.error('Error in auth callback:', error);
          setError(error instanceof Error ? error.message : 'Failed to save user data');
        });
    }
  }, [authState, handleAuthCallback, router, isAuthLoaded, isUserLoaded]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
          {error && (
            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
        
        <SignIn 
          routing="hash" 
          redirectUrl="/dashboard"
          appearance={{
            elements: {
              formButtonPrimary: 
                'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
              card: 'bg-transparent shadow-none',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              formFieldInput: 
                'rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500',
            },
          }}
        />
      </div>
    </div>
  );
}
