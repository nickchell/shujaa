// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes (no auth needed)
const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/login(.*)',
  '/signup(.*)',
  '/api/webhook(.*)',
  '/favicon.ico',
  '/_next/(.*)',
  '/images/(.*)',
  '/assets/(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};