import { NextRequest } from 'next/server';

declare module '@clerk/nextjs' {
  export interface ClerkMiddlewareAuth {
    userId: string | null;
    sessionId: string | null;
    isSignedIn: boolean;
  }

  export interface ClerkMiddlewareOptions {
    publicRoutes?: string[];
    afterAuth?: (auth: ClerkMiddlewareAuth, req: NextRequest) => Promise<Response> | Response;
  }

  export function authMiddleware(options?: ClerkMiddlewareOptions): (req: NextRequest) => Promise<Response>;
} 