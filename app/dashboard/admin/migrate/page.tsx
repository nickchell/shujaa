'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function MigratePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Protect this admin page
  if (isLoaded && !user) {
    router.push('/login');
    return null;
  }

  const runMigration = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/referrals/migrate-codes', {
        method: 'POST',
      });

      const data = await response.json();
      setResults(data);

      if (response.ok) {
        toast({
          title: "Migration Successful",
          description: `Updated ${data.stats.codesUpdated} referral codes and ${data.stats.referralsUpdated} referred_by values`,
        });
      } else {
        toast({
          title: "Migration Failed",
          description: data.error || "An error occurred during migration",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Migration error:', error);
      toast({
        title: "Migration Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Referral Code Migration</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Migrate Referral Codes</CardTitle>
          <CardDescription>
            This will update all referral codes in the database to use the standard "rafiki-" prefix.
            This includes both the referral_code and referred_by fields.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-orange-600 dark:text-orange-400">
              ⚠️ Warning: This is an administrative action that will modify database records.
              Make sure you have a backup before proceeding.
            </p>
            
            <Button 
              onClick={runMigration} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Running Migration..." : "Run Migration"}
            </Button>
            
            {results && (
              <div className="mt-6 p-4 bg-muted rounded-md">
                <h3 className="font-semibold mb-2">Migration Results:</h3>
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 