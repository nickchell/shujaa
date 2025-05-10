import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes — exact paths only
const publicRoutes = [
  '/', // Home page
  '/about', // About page
  '/login', // Login page
  '/login/callback', // Callback after login
  '/signup', // Signup page
  '/signup/callback', // Callback after signup
  '/api/webhook', // Webhook endpoint
  '/favicon.ico', // Favicon
  '/_next/static', // Next.js static files
  '/_next/image', // Next.js image files
  '/images', // Images folder
  '/assets', // Assets folder
  '/api/trpc',
  '/_next',
  '/site.webmanifest',
  '/robots.txt',
  '/sitemap.xml',
  '/fonts',
];

export default clerkMiddleware((auth, req) => {
  const url = new URL(req.url);
  const isPublicRoute = publicRoutes.some(route => url.pathname.startsWith(route));

  // Capture referral code from URL and store in cookie if present
  const ref = url.searchParams.get('ref');
  if (ref) {
    const response = NextResponse.next();
    response.cookies.set('referral_code', ref, { path: '/', maxAge: 60 * 60 * 24 * 7 }); // 7 days
    return response;
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
