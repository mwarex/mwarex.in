import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimizations to prevent Out of Memory crashes on low-RAM machines
  experimental: {
    memoryBasedWorkersCount: true,
  },
  async redirects() {
    return [
      // Fix: Google indexed /auth/login but route is /auth/signin
      {
        source: "/auth/login",
        destination: "/auth/signin",
        permanent: true, // 301 redirect — tells Google permanently moved
      },
    ];
  },
};

export default nextConfig;
