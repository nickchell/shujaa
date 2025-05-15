import { NextResponse } from 'next/server';
import { createAdminClient } from '@/app/lib/supabase/server-utils';
import { auth } from '@clerk/nextjs/server';

interface ReferredUser {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  created_at: string;
}

interface Referral {
  id: string;
  status: 'pending' | 'completed';
  created_at: string;
  referred_user: {
    id: string;
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
    created_at: string;
  };
}

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const supabase = await createAdminClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Failed to initialize database client' },
        { status: 500 }
      );
    }

    // Get the user's referral code
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('referral_code')
      .eq('id', userId)
      .single();

    if (userError || !user?.referral_code) {
      console.error('Error fetching user or no referral code:', userError);
      return NextResponse.json({
        data: {
          referrals: [],
          stats: { total: 0, pending: 0, completed: 0 },
        },
      });
    }
    
    // Get all users who were referred by this user's referral code
    const { data: referredUsers, error: referralsError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        avatar_url,
        phone_number,
        created_at
      `)
      .eq('referred_by', user.referral_code)
      .order('created_at', { ascending: false });

    if (referralsError) {
      console.error('Error fetching referred users:', referralsError);
      return NextResponse.json(
        { error: 'Failed to fetch referrals' },
        { status: 500 }
      );
    }

    // Map to the expected referral format with status based on phone number
    const referrals: Referral[] = (referredUsers || []).map(user => ({
      id: user.id,
      status: user.phone_number ? 'completed' : 'pending',
      created_at: user.created_at,
      referred_user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        phone_number: user.phone_number,
        created_at: user.created_at
      }
    }));

    // Calculate stats
    const completed = referrals.filter(r => r.status === 'completed').length;
    const pending = referrals.length - completed;
    
    const stats = {
      total: referrals.length,
      pending,
      completed,
    };

    return NextResponse.json({
      data: {
        referrals,
        stats,
      },
    });
  } catch (error) {
    console.error('Error in referral list API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
