import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createServerClient, createAdminClient } from '@/app/lib/supabase/server-utils';

// Define types for the response data
interface ReferredUser {
  id: string;
  email: string;
  created_at: string;
}

export async function GET(request: Request) {
  // Initialize Supabase clients inside the function
  const supabase = await createServerClient();
  const adminClient = await createAdminClient();
  
  if (!adminClient) {
    return NextResponse.json(
      { 
        data: null,
        error: 'Failed to initialize admin client',
        status: 'error' 
      },
      { status: 500 }
    );
  }
  
  try {
    // Get the authorization header
    const headersList = await headers();
    const authHeader = headersList.get('authorization') || '';
    const token = authHeader.split(' ')[1] || '';
    
    if (!token) {
      return NextResponse.json(
        { 
          data: null,
          error: 'No authorization token provided',
          status: 'error' 
        },
        { status: 401 }
      );
    }
    
    // Verify the token and get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json(
        { 
          data: null,
          error: 'Invalid or expired token',
          status: 'error' 
        },
        { status: 401 }
      );
    }

    console.log('Fetching user data for ID:', user.id);
    
    // Get the user's data using admin client to bypass RLS
    const { data: userData, error: userDataError } = await adminClient
      .from('users')
      .select('id, email, referral_code, referral_count, referral_earnings, created_at')
      .eq('id', user.id)
      .single();

    if (userDataError || !userData) {
      console.error('Error fetching user data:', userDataError);
      return NextResponse.json(
        { 
          data: null,
          error: 'Failed to fetch user data',
          details: userDataError?.message,
          status: 'error' 
        },
        { status: 500 }
      );
    }

    console.log('User data loaded successfully:', {
      userId: userData.id,
      email: userData.email,
      referralCode: userData.referral_code,
      accountCreated: userData.created_at
    });

    // Get the list of referred users using admin client
    const { data: referredUsers, error: referredError } = await adminClient
      .from('users')
      .select('id, email, created_at')
      .eq('referred_by', user.id)
      .order('created_at', { ascending: false });

    if (referredError) {
      console.error('Error fetching referred users:', referredError);
      return NextResponse.json(
        { 
          data: null,
          error: 'Failed to fetch referred users',
          details: referredError.message,
          status: 'error' 
        },
        { status: 500 }
      );
    }

    // Initialize stats
    const stats = {
      total: 0,
      pending: 0,
      completed: 0
    };
    
    // Get referral stats using admin client
    const { data: referrals, error: referralsError } = await adminClient
      .from('referrals')
      .select('id, status, created_at, reward_granted, reward_type, reward_amount')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });

    if (referralsError) {
      console.error('Error loading referrals:', referralsError);
      return NextResponse.json(
        { 
          data: null,
          error: 'Failed to load referrals',
          details: referralsError.message,
          status: 'error' 
        },
        { status: 500 }
      );
    }

    // Update stats based on referral status
    if (referrals) {
      stats.total = referrals.length;
      referrals.forEach((ref) => {
        if (ref.status === 'pending') stats.pending++;
        if (ref.status === 'completed') stats.completed++;
      });
    }

    // Generate a referral code if the user doesn't have one
    let referralCode = userData.referral_code;
    if (!referralCode) {
      // Generate a random 8-character alphanumeric code
      referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      // Update the user's record with the new referral code using admin client
      const { error: updateError } = await adminClient
        .from('users')
        .update({ referral_code: referralCode })
        .eq('id', user.id);
        
      if (updateError) {
        console.error('Failed to update user with referral code:', updateError);
        return NextResponse.json(
          { 
            data: null,
            error: 'Failed to generate referral code',
          details: updateError.message,
            status: 'error' 
          },
          { status: 500 }
        );
      }
      
      console.log('Generated new referral code:', referralCode);
      
      // Update the userData with the new referral code
      userData.referral_code = referralCode;
    }

    // Define response interface
    interface ReferralResponse {
      data: {
        referralCode: string;
        referralCount: number;
        referralEarnings: number;
        referralLink: string;
        stats: {
          total: number;
          pending: number;
          completed: number;
          rewardAmount: number;
        };
        referredUsers: Array<{
          id: string;
          email: string;
          joinedAt: string;
        }>;
        lastUpdated: string;
      };
      status: string;
    }

    // Format the response
    const response: ReferralResponse = {
      data: {
        referralCode: userData.referral_code || '',
        referralCount: userData.referral_count || 0,
        referralEarnings: userData.referral_earnings || 0,
        referralLink: `${process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-url.com'}/signup?ref=${userData.referral_code || ''}`,
        stats: {
          total: stats.total,
          pending: stats.pending,
          completed: stats.completed,
          rewardAmount: 10 // Default to 10 if not set
        },
        referredUsers: (referredUsers || []).map((user) => ({
          id: user.id,
          email: user.email,
          joinedAt: user.created_at
        })),
        lastUpdated: new Date().toISOString()
      },
      status: 'success'
    };

    console.log('Returning referral data:', response);

    return NextResponse.json(response, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error) {
    console.error('Error in referrals API:', error);
    return NextResponse.json(
      { 
        data: null,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      },
      { status: 500 }
    );
  }
}
