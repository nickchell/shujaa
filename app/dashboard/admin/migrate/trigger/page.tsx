'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function InstallTriggerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Protect this admin page
  if (isLoaded && !user) {
    router.push('/login');
    return null;
  }

  const installTrigger = async () => {
    setIsLoading(true);
    try {
      // This assumes you have an API endpoint that applies the SQL trigger
      const response = await fetch('/api/admin/install-trigger', {
        method: 'POST',
      });

      if (response.ok) {
        setResult('Trigger installed successfully');
        toast({
          title: "Success",
          description: "Referral code normalization trigger installed",
        });
      } else {
        const errorData = await response.json();
        setResult(`Error: ${errorData.error || 'Unknown error'}`);
        toast({
          title: "Installation Failed",
          description: errorData.error || "Failed to install the trigger",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Trigger installation error:', error);
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: "Installation Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Install Database Trigger</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Referral Code Normalization Trigger</CardTitle>
          <CardDescription>
            Install a database trigger that automatically normalizes referral codes to use the "rafiki-" prefix.
            This ensures all referral codes are consistent in the database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-orange-600 dark:text-orange-400">
              ⚠️ Warning: This will create or replace a database trigger.
              Make sure you have a backup before proceeding.
            </p>
            
            <Button 
              onClick={installTrigger} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Installing..." : "Install Trigger"}
            </Button>
            
            {result && (
              <div className="mt-6 p-4 bg-muted rounded-md">
                <h3 className="font-semibold mb-2">Result:</h3>
                <p>{result}</p>
              </div>
            )}
            
            <div className="mt-4 text-sm text-muted-foreground">
              <h3 className="font-semibold mb-1">What this does:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Creates a trigger function to normalize referral codes</li>
                <li>Applies it to both referral_code and referred_by fields</li>
                <li>Ensures all new and updated records use the "rafiki-" prefix</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 