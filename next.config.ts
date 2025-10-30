import type { NextConfig } from "next";
import { withContentlayer } from 'next-contentlayer';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.novametalica.com.br',
        pathname: '/**',
      },
    ],
  },
};

export default withContentlayer(nextConfig);