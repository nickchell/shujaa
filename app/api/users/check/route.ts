import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * API endpoint to check if a user exists in Supabase and get their referral info
 * Used by the verification helpers to ensure referrals are working
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log(`Checking database for user: ${userId}`);
    
    const supabase = createClient();
    
    // Get user data including referral info
    const { data: userData, error } = await supabase
      .from('users')
      .select('id, referral_code, referred_by, email, full_name, avatar_url, provider')
      .eq('id', userId)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking if user exists:', error);
      return NextResponse.json({ 
        error: 'Database error', 
        details: error.message 
      }, { status: 500 });
    }

    // User doesn't exist
    if (!userData) {
      return NextResponse.json({ exists: false });
    }

    // User exists, return their data with exists flag
    return NextResponse.json({
      exists: true,
      id: userData.id,
      referral_code: userData.referral_code,
      referred_by: userData.referred_by,
      email: userData.email,
      full_name: userData.full_name,
      avatar_url: userData.avatar_url,
      provider: userData.provider
    });
    
  } catch (error) {
    console.error('Error in user check API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 