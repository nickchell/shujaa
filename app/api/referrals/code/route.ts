import { createServerClient } from '@/app/lib/supabase/server-utils';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId');
    const prefix = config.referralCodePrefix;

    // If userId wasn't provided as a query param, try to get it from auth
    if (!userId) {
      try {
        const authResult = await auth();
        userId = authResult?.userId || null;
      } catch (authError) {
        console.error('Auth error in referral code API:', authError);
        // Continue with null userId if auth fails
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const supabase = await createServerClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Failed to initialize database client' },
        { status: 500 }
      );
    }
    
    // Check if user already has a referral code
    const { data: user, error: getUserError } = await supabase
      .from('users')
      .select('referral_code')
      .eq('id', userId)
      .maybeSingle();
      
    if (getUserError) {
      console.error('Error getting user:', getUserError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    
    // If user has a code, return it
    if (user && user.referral_code) {
      // If referral code has an old prefix (like shuj-), migrate it to the new prefix
      if (user.referral_code.includes('-') && !user.referral_code.startsWith(prefix)) {
        const oldCode = user.referral_code;
        const newCode = prefix + oldCode.split('-')[1];
        
        // Update the code in the database
        const { error: updateError } = await supabase
          .from('users')
          .update({ referral_code: newCode })
          .eq('id', userId);
          
        if (updateError) {
          console.error('Error updating user referral code:', updateError);
          // Return the old code if update fails
          return NextResponse.json({ code: oldCode });
        }
        
        // Return the new code
        return NextResponse.json({ code: newCode });
      }
      
      return NextResponse.json({ code: user.referral_code });
    }
    
    // Generate a new referral code
    const referralCode = `${prefix}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // Update user with new code
    const { error: updateError } = await supabase
      .from('users')
      .update({ referral_code: referralCode })
      .eq('id', userId);
      
    if (updateError) {
      console.error('Error updating user with referral code:', updateError);
      return NextResponse.json({ error: 'Failed to generate referral code' }, { status: 500 });
    }
    
    return NextResponse.json({ code: referralCode });
  } catch (error) {
    console.error('Error in referral code API:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 