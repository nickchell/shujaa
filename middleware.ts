import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes — exact paths only
const isPublicRoute = createRouteMatcher([
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
]);

export default clerkMiddleware(async (auth, req) => {
  console.log('Middleware processing request:', {
    path: req.nextUrl.pathname,
    isPublic: isPublicRoute(req),
  });

  if (!isPublicRoute(req)) {
    console.log('Protected route, checking auth');
    await auth(); // Require auth for protected routes
  }
});

export const config = {
  matcher: [
    // Match all paths except those with file extensions or excluded routes
    '/((?!.*\\..*|_next|favicon.ico|login|signup|api|webhook).*)',
    // Explicitly protect specific routes like /dashboard/profile
    '/dashboard/profile(.*)',
  ],
};
