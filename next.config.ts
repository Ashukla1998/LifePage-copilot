import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";

// next.config.ts is loaded as an ES module, so __dirname is not defined
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // A stray package-lock.json in the user folder makes Next guess the wrong project root
  turbopack: { root: projectRoot },
  outputFileTracingRoot: projectRoot,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "www.lifepage.in",
        pathname: "/support/**",
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;