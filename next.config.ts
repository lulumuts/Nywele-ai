import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*"],
  /** Segment explorer injects nodes that crash React 19 in dev (`useContext` null) — disables stable page renders. */
  experimental: {
    devtoolSegmentExplorer: false,
  },
  images: {
    domains: ["images.unsplash.com", "images.pexels.com"],
    unoptimized: false,
  },
  /**
   * `three` / examples (GLTFLoader, etc.) — do not add webpack `resolve.alias`
   * for `react` or `react-dom`; that breaks Next.js devtools (invalid hook /
   * useContext).
   */
  transpilePackages: ["three"],
};

const withPWAWrap = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  scope: "/",
  sw: "sw.js",
  cacheOnFrontEndNav: true,
  fallbacks: {
    document: "/offline",
  },
});

export default withPWAWrap(nextConfig);
