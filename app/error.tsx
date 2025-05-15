'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { validateEnv } from '@/lib/env';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to the console
    console.error('Application Error:', error);
    
    // Check if environment variables are properly configured
    validateEnv();
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="bg-red-50 dark:bg-red-900/20 border-b">
          <CardTitle className="text-red-700 dark:text-red-300">
            Something went wrong!
          </CardTitle>
          <CardDescription>
            The application encountered an unexpected error.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 pb-4">
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {error.message || "An unexpected error occurred. Please try again later."}
            </p>
            
            {error.digest && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Go to Home
          </Button>
          <Button onClick={() => reset()}>
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 