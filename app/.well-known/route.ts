import { NextResponse } from 'next/server';

// Handle .well-known requests without using headers() improperly
export async function GET(request: Request) {
  const url = new URL(request.url);
  console.log('Well-known route handler called for:', url.pathname);
  
  // Return 404 instead of using NextResponse.next()
  return new NextResponse(null, { status: 404 });
} 