import { NextResponse } from 'next/server';

// In this case, we just need to make sure the route exists
// The actual OAuth handling is done client-side in the page component
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirectUrl = searchParams.get('redirect_url') || '/dashboard';
  
  // Log the incoming callback request
  console.log('SSO callback route handler: passing through to client component');
  
  // We don't actually need to do any server-side processing here
  // Return 200 to allow the page component to handle the OAuth flow
  return new NextResponse(null, { status: 200 });
} 