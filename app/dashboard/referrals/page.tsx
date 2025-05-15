'use client';

import { ReferralPageContent } from '@/components/referrals/referral-page-content';
import { useEffect, useState } from 'react';

// This is a client component that fetches data from the API
type ReferralData = {
  referralCode: string;
  referralLink: string;
};

export default function ReferralsPage() {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReferralData() {
      try {
        setLoading(true);
        console.log('🔍 Fetching referral data...');
        const response = await fetch('/api/referrals/info', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('📡 Response status:', response.status);
        
        const data = await response.json().catch(async (parseError) => {
          console.error('❌ Failed to parse JSON response:', parseError);
          const text = await response.text();
          console.log('📄 Raw response text:', text);
          throw new Error(`Invalid JSON response: ${text}`);
        });

        if (!response.ok) {
          console.error('❌ API Error:', data);
          throw new Error(data.error || 'Failed to fetch referral data');
        }

        console.log('✅ Received referral data:', data);
        setReferralData(data);
      } catch (err) {
        console.error('❌ Error in fetchReferralData:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchReferralData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!referralData) {
    return <div>No referral data found</div>;
  }
  
  return (
    <ReferralPageContent 
      initialReferralCode={referralData.referralCode}
      initialReferralLink={referralData.referralLink}
    />
  );
}