import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: false,
  },
  output: 'standalone',
};

// Set port to 4000
process.env.PORT = process.env.PORT || '4000';

export default nextConfig;
