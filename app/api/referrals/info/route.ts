import { NextResponse } from 'next/server';
import { createServerClient } from '@/app/lib/supabase/server-utils';
import { auth } from '@clerk/nextjs/server';

// Enable debug logging
const DEBUG = true;

function log(...args: any[]) {
  if (DEBUG) {
    console.log('[referrals/info]', ...args);
  }
}

export async function GET() {
  log('🔍 Starting request');
  
  try {
    // Verify authentication
    log('🔑 Authenticating request...');
    const authResult = await auth();
    log('🔑 Auth result:', authResult.userId ? 'Authenticated' : 'Not authenticated');
    
    if (!authResult.userId) {
      log('❌ Unauthorized: No user ID found');
      return NextResponse.json(
        { error: 'Not authenticated', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { userId } = authResult;
    log(`👤 User ID: ${userId}`);

    // Initialize Supabase
    log('🔌 Initializing Supabase client...');
    let supabase;
    try {
      supabase = await createServerClient();
      log('✅ Supabase client initialized');
    } catch (dbError) {
      log('❌ Failed to initialize Supabase client:', dbError);
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          code: 'DB_CONNECTION_ERROR',
          details: dbError instanceof Error ? dbError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    // Fetch user profile
    log('📡 Querying user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('referral_code, email')
      .eq('id', userId)
      .single();

    // If no referral code exists, generate one
    if (profile && !profile.referral_code) {
      log('ℹ️ No referral code found, generating one...');
      const newReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      // Update user with new referral code
      const { error: updateError } = await supabase
        .from('users')
        .update({ referral_code: newReferralCode })
        .eq('id', userId);
      
      if (updateError) {
        log('❌ Failed to generate referral code:', updateError);
      } else {
        log('✅ Generated new referral code:', newReferralCode);
        profile.referral_code = newReferralCode;
      }
    }

    if (profileError) {
      log('❌ Profile query error:', profileError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch user profile',
          code: 'PROFILE_FETCH_ERROR',
          details: profileError.message
        },
        { status: 500 }
      );
    }

    if (!profile) {
      log('❌ Profile not found for user:', userId);
      return NextResponse.json(
        { 
          error: 'User profile not found',
          code: 'PROFILE_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    log('📋 Profile data:', profile);

    // Fetch base URL from app_config
    log('🔍 Fetching base URL from app_config...');
    try {
      let tableExists = false;
      // First, try to check if the table exists using RPC
      try {
        const { data: tableInfo, error: tableError } = await supabase
          .rpc('get_table_info', { table_name: 'app_config' });
        
        tableExists = !!tableInfo && !tableError;
        log('📊 Table info (RPC):', { tableInfo, tableError, tableExists });
      } catch (rpcError) {
        log('⚠️ RPC error, trying alternative method to check table existence');
        // Fallback: Try a simple query to check if table exists
        try {
          const { data, error } = await supabase
            .from('app_config')
            .select('*')
            .limit(1);
          
          tableExists = !error && Array.isArray(data);
          log('📊 Table check fallback result:', { error, tableExists });
        } catch (fallbackError) {
          log('⚠️ Fallback table check failed:', fallbackError);
        }
      }
      
      const { data: config, error: configError } = await supabase
        .from('app_config')
        .select('*')
        .eq('key', 'base_url')
        .single();

      log('🔍 Config query result:', { 
        config,
        configError: configError ? {
          message: configError.message,
          code: configError.code,
          details: configError.details,
          hint: configError.hint
        } : null,
        tableExists
      });
      
      if (configError) {
        log('⚠️ Config query error:', {
          message: configError.message,
          code: configError.code,
          details: configError.details,
          hint: configError.hint
        });
      } else if (!config) {
        log('⚠️ No config found for key: base_url');
      } else {
        log('✅ Found config:', config);
        // Continue with the config
        const baseUrl = config.value || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        log('ℹ️ Using base URL from config:', baseUrl);
        
        const referralCode = profile.referral_code || '';
        const referralLink = referralCode ? `${baseUrl}/signup?ref=${referralCode}` : '';
        
        const responseData = {
          referralCode: referralCode || '',
          referralLink: referralLink || '',
          baseUrl: baseUrl || '',
          success: true
        };
        
        log('✅ Request successful, sending response:', responseData);
        return NextResponse.json(responseData);
      }
    } catch (error) {
      log('⚠️ Error fetching config:', error);
    }

    // Fallback if no config found
    log('🔍 Environment variables:', {
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NODE_ENV: process.env.NODE_ENV
    });
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    log('ℹ️ Using fallback base URL:', baseUrl);
    const referralCode = profile.referral_code || '';
    const referralLink = referralCode ? `${baseUrl}/signup?ref=${referralCode}` : '';

    const responseData = {
      referralCode: referralCode || '',
      referralLink: referralLink || '',
      baseUrl: baseUrl || '',
      success: true
    };

    log('✅ Request successful, sending fallback response:', responseData);
    return NextResponse.json(responseData);
    
  } catch (error) {
    log('❌ Unhandled error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
