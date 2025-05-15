import { NextResponse } from 'next/server';
import { authMiddleware } from '@clerk/nextjs';
import { validateEnv } from '@/lib/env';
import { headers } from 'next/headers';

// Add a global type declaration for our environment validation flag
declare global {
  var envValidated: boolean;
}

// Middleware that validates environment variables before serving requests
async function envMiddleware() {
  // Only check once during startup - don't repeatedly validate env vars on every request
  if (global.envValidated !== true) {
    try {
      const isValid = validateEnv();
      global.envValidated = isValid;
      
      // In development, don't block requests if env vars are missing
      if (!isValid && process.env.NODE_ENV === 'production') {
        console.error('Application environment is not properly configured');
        return new NextResponse(
          JSON.stringify({
            error: 'Server configuration error',
            message: 'The application is not properly configured. Please check server logs.'
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    } catch (error) {
      console.error('Error validating environment:', error);
      // Continue anyway to avoid blocking the app
    }
  }
  
  return NextResponse.next();
}

// Configure CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS method for CORS preflight
async function handleOptions() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsHeaders,
    },
  });
}

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
  beforeAuth: (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return handleOptions();
    }
    
    // Process env validation
    return envMiddleware();
  },
  publicRoutes: [
    '/',
    '/login',
    '/login/[[...sign-in]]',
    '/login/sso-callback',
    '/login/sso-callback/:path*',
    '/api/tasks/:path*',
    '/sign-in',
    '/signup',
    '/sign-up',
    '/welcome',
    '/api/webhooks/clerk',
    '/api/webhook/clerk',
    '/api/users/check',
    '/api/referrals/code',
    '/api/referrals/validate',
    '/api/referrals/create',
    '/api/referrals/status',
    '/api/referrals/migrate-codes',
    '/api/info',
  ],
  ignoredRoutes: [
    '/_next',
    '/_next/static',
    '/_next/image',
    '/_next/webpack-hmr',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/manifest.json',
    '/.well-known',
  ],
  debug: process.env.NODE_ENV === 'development',
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}; 