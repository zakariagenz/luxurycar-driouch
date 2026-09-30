import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep production deploys from failing on lint warnings
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
