// clerk.config.ts (or any file where you configure Clerk)

export const clerkConfig = {
    // These are the URLs for sign-in and sign-up pages
    signInUrl: "/login",       // The route for signing in
    signUpUrl: "/login?tab=register", // The route for signing up
  
    // These are the routes to redirect to after successful sign-in or sign-up
    afterSignInUrl: "/dashboard",  // Redirect to dashboard after sign-in
    afterSignUpUrl: "/dashboard",  // Redirect to dashboard after sign-up
  
    // Session configuration
    session: {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      tokenRefresh: {
        enabled: true,
        interval: 60 * 60, // Refresh token every hour
      },
    },
};
  