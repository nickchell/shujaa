import { createServerClient } from '@/app/lib/supabase/server-utils';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { referrerId, referredId } = await request.json();
    
    if (!referrerId || !referredId) {
      return NextResponse.json(
        { error: 'Both referrer ID and referred ID are required' },
        { status: 400 }
      );
    }

    // Prevent self-referral
    if (referrerId === referredId) {
      return NextResponse.json(
        { error: 'You cannot refer yourself' },
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
    
    // Check if this referral already exists
    const { data: existingReferral, error: checkError } = await supabase
      .from('referrals')
      .select('id')
      .eq('referrer_id', referrerId)
      .eq('referred_id', referredId)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking existing referral:', checkError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }
    
    if (existingReferral) {
      return NextResponse.json(
        { message: 'Referral already exists', referral: existingReferral }
      );
    }
    
    // Create the referral
    const { data: referral, error: insertError } = await supabase
      .from('referrals')
      .insert([{
        referrer_id: referrerId,
        referred_id: referredId,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
      
    if (insertError) {
      console.error('Error creating referral:', insertError);
      return NextResponse.json(
        { error: 'Failed to create referral' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Referral created successfully',
      referral
    });
    
  } catch (error) {
    console.error('Error in create referral API:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
} 