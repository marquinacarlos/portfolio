import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Allow HMR when opening the dev server from other devices on the LAN
  allowedDevOrigins: ["192.168.0.17"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
