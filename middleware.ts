import { authMiddleware } from '@clerk/nextjs';
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
];

export default authMiddleware({
  publicRoutes,
  afterAuth(auth: AuthObject, req: NextRequest) {
    // Handle users who aren't authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/login', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // If the user is logged in and trying to access a protected route, let them through
    if (auth.userId && !auth.isPublicRoute) {
      return;
    }

    // If the user is logged in and trying to access a public route, redirect to dashboard
    if (auth.userId && auth.isPublicRoute && req.nextUrl.pathname === '/') {
      const dashboardUrl = new URL('/dashboard', req.url);
      return NextResponse.redirect(dashboardUrl);
    }
  },
  debug: true,
});

export const config = {
  matcher: [
    // Match all paths except those with file extensions or excluded routes
    '/((?!.*\\..*|_next|favicon.ico|login|signup|api|webhook).*)',
    // Explicitly protect specific routes like /dashboard/profile
    '/dashboard/profile(.*)',
  ],
};
