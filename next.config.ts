import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' va.vercel-scripts.com scripts.simpleanalyticscdn.com *.cal.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: github.com avatars.githubusercontent.com *.twimg.com pbs.twimg.com abs.twimg.com; font-src 'self' data:; connect-src 'self' github-contributions-api.deno.dev; frame-src 'self' *.cal.com; media-src 'self' video.twimg.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
];

const nextConfig: NextConfig = {
  // Hardened security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: "https", hostname: "github.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },

  // Performance & Infrastructure optimizations
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  
  // Optimize for Vercel Edge where possible
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "react-icons",
      "motion",
      "@calcom/embed-react",
    ],
    // Optimize CSS
    optimizeCss: true,
  },
  
  // Turbopack config (empty to silence warning)
  turbopack: {},
};

export default nextConfig;
