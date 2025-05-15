import { NextResponse } from 'next/server';
import { saveUserToSupabase } from '@/lib/supabase/save-user';

/**
 * API endpoint to ensure user data is saved to Supabase
 * Now uses the saveUserToSupabase utility function for consistency
 */
export async function POST(request: Request) {
  console.log('=== START: /api/users/ensure ===');
  
  try {
    console.log('1. Parsing request body...');
    let requestData: any;
    try {
      requestData = await request.json();
      console.log('Request data:', JSON.stringify({
        ...requestData,
        // Don't log the entire user object if it's large
        user: requestData.user ? '[User object]' : undefined
      }, null, 2));
    } catch (parseError) {
      const errorMessage = 'Failed to parse request body as JSON';
      console.error(errorMessage, parseError);
      return NextResponse.json({ 
        success: false,
        error: errorMessage,
        details: parseError instanceof Error ? parseError.message : 'Unknown error'
      }, { status: 400 });
    }
    
    console.log('2. Validating request data...');
    const { 
      userId, 
      email, 
      firstName,
      lastName,
      fullName,
      imageUrl,
      referredBy 
    } = requestData;
    
    if (!userId) {
      const error = 'User ID is required';
      console.error('Validation error:', error);
      return NextResponse.json({ 
        success: false,
        error: error,
        details: 'No user ID provided in the request'
      }, { status: 400 });
    }

    console.log('3. Processing user data:', { 
      userId, 
      email: email ? '[email]' : 'not provided',
      fullName: fullName ? '[name]' : 'not provided',
      hasReferralCode: !!referredBy 
    });

    try {
      console.log('4. Calling saveUserToSupabase...');
      const result = await saveUserToSupabase({
        userId,
        email,
        firstName,
        lastName,
        fullName,
        imageUrl,
        referredBy
      });

      console.log('5. Successfully saved user:', {
        userId,
        hasUser: !!result.user,
        message: result.message,
        referralCode: result.user?.referral_code ? '***' : 'none',
        referredBy: result.user?.referred_by ? '***' : 'none'
      });

      return NextResponse.json({
        success: true,
        message: result.message,
        user: result.user,
        referralCode: result.user?.referral_code,
        referredBy: result.user?.referred_by || null
      });
      
    } catch (saveError) {
      const errorMessage = saveError instanceof Error ? saveError.message : 'Unknown error saving user';
      console.error('Error in saveUserToSupabase:', {
        error: errorMessage,
        stack: saveError instanceof Error ? saveError.stack : 'No stack trace',
        userId
      });
      
      return NextResponse.json({
        success: false,
        error: errorMessage,
        details: saveError instanceof Error ? saveError.stack : 'No additional details'
      }, { status: 500 });
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to process request';
    console.error('Unhandled error in /api/users/ensure:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: errorMessage
    }, { status: 500 });
  } finally {
    console.log('=== END: /api/users/ensure ===');
  }
}