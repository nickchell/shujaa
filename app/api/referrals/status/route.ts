import { createServerClient } from '@/app/lib/supabase/server-utils';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { referralId, status } = await request.json();

    if (!referralId || !status) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Validate status
    if (!['pending', 'completed', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Failed to initialize database client' },
        { status: 500 }
      );
    }
    
    // Update the referral status
    const { data: referral, error } = await supabase
      .from('referrals')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', referralId)
      .select()
      .single();

    if (error) {
      console.error('Error updating referral status:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // If status is completed, update reward_granted flag
    if (status === 'completed' && !referral.reward_granted) {
      const { error: rewardError } = await supabase
        .from('referrals')
        .update({ 
          reward_granted: true,
          reward_amount: 50, // Default reward amount
          reward_date: new Date().toISOString()
        })
        .eq('id', referralId);

      if (rewardError) {
        console.error('Error granting referral reward:', rewardError);
        // Continue anyway as the status was updated
      }
    }

    return NextResponse.json({ 
      referral,
      message: `Referral status updated to ${status}`
    });
  } catch (error) {
    console.error('Error in update referral status endpoint:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
} 