import type { NextConfig } from "next";

const allowedOrigins = [
  "localhost:3000",
  "infamous-snowboard.com",
  "www.infamous-snowboard.com",
  "infamous-snowboard.vercel.app",
];

// Include Vercel preview deployment URLs automatically
if (process.env.VERCEL_URL) {
  allowedOrigins.push(process.env.VERCEL_URL);
}
if (process.env.VERCEL_BRANCH_URL) {
  allowedOrigins.push(process.env.VERCEL_BRANCH_URL);
}

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins,
    },
  },
};

export default nextConfig;
