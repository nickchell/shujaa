'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/hooks/use-toast';

interface EnsureUserProps {
  onUserEnsured?: (userId: string) => void;
  onError?: (error: string) => void;
}

/**
 * This component ensures that a user's data is saved to Supabase
 * It should be included in the dashboard or other protected pages
 */
const EnsureUser = ({ onUserEnsured, onError }: EnsureUserProps) => {
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const [ensured, setEnsured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('EnsureUser: useEffect triggered', { isLoaded, user, ensured });
    
    const saveUserToSupabase = async () => {
      console.log('EnsureUser: Starting saveUserToSupabase');
      
      if (!isLoaded) {
        console.log('EnsureUser: Auth not yet loaded');
        setIsLoading(false);
        return;
      }

      if (!user) {
        console.error('EnsureUser: No user found');
        setIsLoading(false);
        return;
      }

      if (ensured) {
        console.log('EnsureUser: User already ensured');
        setIsLoading(false);
        onUserEnsured?.(user.id);
        return;
      }

      try {
        console.log('EnsureUser: Starting user data synchronization');
        setIsLoading(true);
        setError(null);
        
        // Check for referral code in localStorage or sessionStorage
        const referralCode = localStorage.getItem('referralCode') || sessionStorage.getItem('referralCode');
        
        const userData = {
          userId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          imageUrl: user.imageUrl,
          referredBy: referralCode // Include the referral code if present
        };
        
        console.log('EnsureUser: User data to sync:', userData);
        
        console.log('EnsureUser: Sending request to /api/users/ensure');
        const response = await fetch('/api/users/ensure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });

        console.log('EnsureUser: Received response', { status: response.status });
        const data = await response.json().catch(e => {
          console.error('EnsureUser: Failed to parse response as JSON', e);
          return { error: 'Invalid response from server' };
        });
        
        if (!response.ok) {
          const errorMessage = data?.error || 'Failed to save user data';
          console.error('EnsureUser: Failed to ensure user exists in Supabase:', {
            status: response.status,
            statusText: response.statusText,
            error: errorMessage,
            response: data
          });
          
          setError(errorMessage);
          onError?.(errorMessage);
          
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive"
          });
        } else {
          console.log('EnsureUser: User data synchronized with Supabase:', data);
          setEnsured(true);
          onUserEnsured?.(user.id);
          
          // Clear any stored referral code after successful use
          if (referralCode) {
            console.log('EnsureUser: Clearing stored referral code');
            localStorage.removeItem('referralCode');
            sessionStorage.removeItem('referralCode');
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to connect to the database. Please try refreshing the page.';
        console.error('Error saving user data to Supabase:', error);
        setError(errorMessage);
        onError?.(errorMessage);
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    };

    saveUserToSupabase();
  }, [user, isLoaded, ensured, toast]);

  // This component doesn't render anything
  return null;
};

export default EnsureUser;