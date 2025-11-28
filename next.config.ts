import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React Compiler for better performance
  reactCompiler: true,

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        pathname: "/**",
      },
    ],
    // Optimize images for production
    formats: ["image/avif", "image/webp"],
  },

  // Production optimizations
  poweredByHeader: false,

  // Compress responses
  compress: true,

  // Generate source maps in production for debugging
  productionBrowserSourceMaps: false,

  // Strict mode for better development experience
  reactStrictMode: true,

  // Environment variables validation
  env: {
    NEXT_PUBLIC_APP_NAME: "Safety Nexus",
    NEXT_PUBLIC_APP_VERSION: "1.0.0",
  },
};

export default nextConfig;
