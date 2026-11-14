import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Allow HMR when opening the dev server from other devices on the LAN
  // (la IP de tu Mac en la red puede cambiar; si el móvil deja de conectar bien, añade la nueva)
  allowedDevOrigins: ["192.168.0.14", "192.168.0.17"],
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
