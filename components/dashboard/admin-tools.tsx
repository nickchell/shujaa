'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/nextjs';
import { Loader2, RefreshCw, Info } from 'lucide-react';

export function AdminTools() {
  const { user } = useUser();
  const { toast } = useToast();
  const [isMigrating, setIsMigrating] = useState(false);
  const [result, setResult] = useState<null | { migrated: number; total: number; errors?: any[] }>(null);

  const migrateReferralCodes = async () => {
    if (!user?.id) return;
    
    try {
      setIsMigrating(true);
      setResult(null);
      
      const response = await fetch('/api/referrals/migrate-codes', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to migrate referral codes');
      }
      
      setResult(data);
      
      toast({
        title: "Migration Complete",
        description: `Successfully migrated ${data.migrated} of ${data.total} referral codes.`,
      });
    } catch (error) {
      console.error('Error migrating referral codes:', error);
      toast({
        title: "Migration Failed",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Tools</CardTitle>
        <CardDescription>Special tools for managing the application</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-md font-semibold mb-2">Referral Code Migration</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Update all existing referral codes to use the 'rafiki-' prefix format.
            This is a one-time operation to standardize codes.
          </p>
          <Button 
            onClick={migrateReferralCodes} 
            disabled={isMigrating}
            className="w-full sm:w-auto"
          >
            {isMigrating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Migrating Codes...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" /> 
                Migrate Referral Codes
              </>
            )}
          </Button>
        </div>
        
        {result && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Migration Results</AlertTitle>
            <AlertDescription>
              Successfully migrated {result.migrated} out of {result.total} referral codes.
              {result.errors && result.errors.length > 0 && (
                <p className="text-red-500 mt-2">
                  {result.errors.length} errors occurred during migration.
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
} 