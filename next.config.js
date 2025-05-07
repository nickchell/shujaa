/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  
  // Enable server actions
  experimental: {
    appDir: true,
    serverActions: true, // Enable Server Actions
  },
  
  // Clerk middleware matcher (optional if you need finer control over which routes are protected)
  matcher: [
    /*
     * Match all routes except:
     * - static files
     * - publicRoutes defined in middleware.ts
     */
    "/((?!.*\\..*|_next|favicon.ico|login|signup|about|api/webhook).*)",
  ],
};

module.exports = nextConfig;
