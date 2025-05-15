import { NextResponse } from 'next/server';

/**
 * API endpoint that provides basic app information
 * Access this at /api/info
 */
export async function GET(request: Request) {

  // Return information about the app
  return NextResponse.json({ 
    app: 'Rafiki Rewards',
    description: 'Earn free Safaricom data bundles by referring friends and completing simple tasks',
    timestamp: new Date().toISOString()
  });
}