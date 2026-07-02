import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: '/home/ubuntu/.openclaw/workspace/cyberflation',
  },
  allowedDevOrigins: ['43.134.235.4', 'localhost', '127.0.0.1'],
};

export default nextConfig;
