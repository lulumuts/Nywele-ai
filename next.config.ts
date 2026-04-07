import type { NextConfig } from "next";

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

export default nextConfig;
