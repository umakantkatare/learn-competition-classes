import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn-icons-png.flaticon.com",
        pathname: "/512/**",
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/cpsrwnuw5/**",
      },
      {
        protocol: "https",
        hostname: "pixabay.com",
        pathname: "/images/download/**",
      },
    ],

    formats: ["image/avif", "image/webp"],

    minimumCacheTTL: 60 * 60 * 24 * 30,

    deviceSizes: [360, 640, 750, 828, 1080, 1200, 1920],

    imageSizes: [32, 48, 64, 96, 128, 256, 384],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
