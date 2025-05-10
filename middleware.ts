import { authMiddleware } from '@clerk/nextjs';

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
