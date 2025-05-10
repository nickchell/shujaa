import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();
    console.log('Checking for existing user:', userId);

    // First try to get the user
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, referral_code')
      .eq('id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }

    // If user exists and has a referral code, return it
    if (existingUser?.referral_code) {
      console.log('Found existing user with referral code:', existingUser.referral_code);
      return NextResponse.json({ referralCode: existingUser.referral_code });
    }

    // Generate a referral code
    const referralCode = `shuj-${userId.slice(0, 4)}${Math.floor(Math.random() * 10000)}`;
    console.log('Generated referral code:', referralCode);

    // If user exists but no referral code, update it
    if (existingUser && !existingUser.referral_code) {
      console.log('Updating existing user with referral code');
      const { error: updateError } = await supabase
        .from('users')
        .update({ referral_code: referralCode })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user with referral code:', updateError);
        // Fallback: Try to insert a new record if update fails
        const user = await currentUser();
        if (!user) {
          console.error('Failed to get user details from Clerk');
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
          console.error('Error inserting user with referral code:', insertError);
          return NextResponse.json({ error: 'Failed to update or insert user' }, { status: 500 });
        }
      }

      return NextResponse.json({ referralCode });
    }

    // If user doesn't exist, get user details from Clerk
    const user = await currentUser();
    if (!user) {
      console.error('Failed to get user details from Clerk');
      return NextResponse.json({ error: 'Failed to get user details' }, { status: 500 });
    }

    // Create new user with referral code and Clerk details
    console.log('Creating new user with referral code');
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
      console.error('Error creating user:', insertError);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    return NextResponse.json({ referralCode });
  } catch (error) {
    console.error('Error in referral code generation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 