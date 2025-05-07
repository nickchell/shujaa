// clerk.config.ts (or any file where you configure Clerk)

export const clerkConfig = {
    // These are the URLs for sign-in and sign-up pages
    signInUrl: "/login",       // The route for signing in
    signUpUrl: "/login?tab=register", // The route for signing up
  
    // These are the routes to redirect to after successful sign-in or sign-up
    afterSignInUrl: "/dashboard",  // Redirect to dashboard after sign-in
    afterSignUpUrl: "/dashboard",  // Redirect to dashboard after sign-up
  
    // Optionally, specify API keys or any other Clerk settings here
  };
  