// Clerk configuration
export const clerkConfig = {
  // Routes
  signInUrl: '/login',
  signUpUrl: '/signup',
  
  // Redirects after authentication
  afterSignInUrl: '/dashboard',
  afterSignUpUrl: '/dashboard',
  
  // Other configuration
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
}; 