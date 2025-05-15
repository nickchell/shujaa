'use client';

import dynamic from 'next/dynamic';
import { useLoading } from '@/components/providers/loading-provider';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

// Dynamically import SignIn component to avoid SSR issues
const SignInComponent = dynamic(
  () => import('@clerk/nextjs').then((mod) => ({ default: mod.SignIn })),
  { ssr: false }
);

export default function SignInPage() {
  const { isLoading } = useLoading();
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    // Mark component as ready on client side
    setClientReady(true);
    
    // Check if the user is already authenticated and redirect to dashboard
    if (isLoaded && userId) {
      router.push('/dashboard');
    }
  }, [isLoaded, userId, router]);

  // Show loading state while initializing or redirecting
  if (isLoading || (isLoaded && userId) || !clientReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Loading</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignInComponent />
    </div>
  );
} 