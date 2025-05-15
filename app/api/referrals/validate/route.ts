import { createServerClient } from '@/app/lib/supabase/server-utils';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const userId = searchParams.get('userId');

    if (!code || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters', valid: false },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Failed to initialize database client', valid: false },
        { status: 500 }
      );
    }
    
    const { data: referrer, error } = await supabase
      .from('users')
      .select('id')
      .eq('referral_code', code)
      .maybeSingle();

    if (error) {
      console.error('Error validating referral:', error);
      return NextResponse.json(
        { error: error.message, valid: false },
        { status: 500 }
      );
    }

    // Valid if:
    // 1. Referrer exists with this code
    // 2. User is not referring themselves
    const isValid = !!referrer && referrer.id !== userId;

    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error('Error in referral validation endpoint:', error);
    return NextResponse.json(
      { error: 'Server error', valid: false },
      { status: 500 }
    );
  }
} 