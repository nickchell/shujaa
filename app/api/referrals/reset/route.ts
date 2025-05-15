import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    
    // Soft reset: Mark all referrals as rejected
    const { error } = await supabase
      .from('referrals')
      .update({ 
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('referrer_id', userId);

    if (error) {
      console.error('Error resetting referral stats:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Referral stats reset successfully'
    });
  } catch (error) {
    console.error('Error in reset referral stats endpoint:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
} 