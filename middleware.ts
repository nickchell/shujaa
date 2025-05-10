import { authMiddleware, type AuthObject } from '@clerk/nextjs';
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

export default authMiddleware({
  publicRoutes,
  afterAuth(auth: AuthObject, req: NextRequest) {
    const url = new URL(req.url);
    const isPublicRoute = publicRoutes.some(route => 
      url.pathname.startsWith(route)
    );

    // Handle users who aren't authenticated
    if (!auth.userId && !isPublicRoute) {
      const signInUrl = new URL('/login', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // If the user is logged in and trying to access a protected route, let them through
    if (auth.userId && !isPublicRoute) {
      return;
    }

    // If the user is logged in and trying to access a public route, redirect to dashboard
    if (auth.userId && url.pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  debug: true,
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
