/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {} // not `true`
  },
  images: {
    domains: ['images.pexels.com'], // Add other domains as needed
  },
};

module.exports = nextConfig;
