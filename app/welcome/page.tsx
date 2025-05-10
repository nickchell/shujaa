'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function WelcomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WelcomeContent />
    </Suspense>
  );
}

function WelcomeContent() {
  const searchParams = useSearchParams();
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const referralCode = searchParams.get('ref');

  useEffect(() => {
    const fetchReferrerDetails = async () => {
      if (!referralCode) {
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('users')
          .select('full_name')
          .eq('referral_code', referralCode)
          .single();

        if (error) {
          console.error('Error fetching referrer details:', error);
        } else if (data) {
          setReferrerName(data.full_name);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchReferrerDetails();
  }, [referralCode]);

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <Card className="border-2 border-primary/20">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Welcome
          </CardTitle>
          <CardDescription className="text-xl">
            {referrerName ? (
              <>
                <span className="font-semibold text-primary">{referrerName}</span> has invited you to join them in the most awesome deals finder in Kenya!
              </>
            ) : (
              'Join the most awesome deals finder in Kenya!'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 text-center">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Why Join Rafiki?</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>✨ Find the best deals and discounts</li>
                <li>🎁 Earn rewards for your referrals</li>
                <li>💎 Get exclusive access to special offers</li>
                <li>🌟 Join a community of savvy shoppers</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button asChild size="lg" className="animate-pulse-scale">
              <Link href="/login" className="flex items-center gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 