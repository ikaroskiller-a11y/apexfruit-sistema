import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Fotos de inspección subidas a Vercel Blob (ver src/lib/fotos.ts) —
    // el subdominio es fijo por store, no cambia entre despliegues.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
