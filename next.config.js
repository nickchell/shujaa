/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['img.clerk.com', 'images.clerk.dev','images.pexels.com'],
    unoptimized: process.env.NODE_ENV !== 'production',
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'printers-polish-context-universal.trycloudflare.com'],
    },
  },
  // Ensure CSS optimization is enabled
  optimizeCss: true,
  // Speed up production builds
  swcMinify: true,
};

module.exports = nextConfig;
