import { auth, currentUser } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }
    
    const prefix = config.referralCodePrefix;

    // First try to get the user
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, referral_code')
      .eq('id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }

    // If user exists and has a referral code, return it
    if (existingUser?.referral_code) {
      return NextResponse.json({ referralCode: existingUser.referral_code });
    }

    // Generate a referral code
    const referralCode = `${prefix}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // If user exists but no referral code, update it
    if (existingUser && !existingUser.referral_code) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ referral_code: referralCode })
        .eq('id', userId);

      if (updateError) {
        // Fallback: Try to insert a new record if update fails
        const user = await currentUser();
        if (!user) {
          return NextResponse.json({ error: 'Failed to get user details' }, { status: 500 });
        }
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: userId,
              referral_code: referralCode,
              provider: 'clerk',
              email: user.emailAddresses[0]?.emailAddress || '',
              full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous',
              avatar_url: user.imageUrl || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);

        if (insertError) {
          return NextResponse.json({ error: 'Failed to update or insert user' }, { status: 500 });
        }
      }

      return NextResponse.json({ referralCode });
    }

    // If user doesn't exist, get user details from Clerk
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Failed to get user details' }, { status: 500 });
    }

    // Create new user with referral code and Clerk details
    const { error: insertError } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          referral_code: referralCode,
          provider: 'clerk',
          email: user.emailAddresses[0]?.emailAddress || '',
          full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous',
          avatar_url: user.imageUrl || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);

    if (insertError) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    return NextResponse.json({ referralCode });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 