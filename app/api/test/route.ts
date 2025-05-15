import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET() {
  // Return information about API and welcome route working
  return NextResponse.json({ 
    status: 'API routes are working',
    welcomePage: 'Should be accessible at /welcome without authentication',
    welcomeWithRef: 'Try visiting /welcome?ref=TEST123 to test the referral flow',
    currentTime: new Date().toISOString(),
    config: {
      baseUrl: config.baseUrl,
      referralUrl: config.referralUrl
    }
  });
} 