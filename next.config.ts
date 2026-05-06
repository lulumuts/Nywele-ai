import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*"],
  /** Segment explorer injects nodes that crash React 19 in dev (`useContext` null) — disables stable page renders. */
  experimental: {
    devtoolSegmentExplorer: false,
  },
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      /**
       * Dev stability: on this machine Next's webpack persistent cache regularly corrupts
       * (`*.pack.gz_` rename ENOENT → missing chunks → `__webpack_modules__` runtime errors).
       * Disabling the persistent cache avoids the broken state at the cost of rebuild speed.
       */
      config.cache = false;
    }
    if (dev && !isServer && config.output) {
      // Avoid ChunkLoadError when the first compile of a large route is slower than the default timeout.
      config.output.chunkLoadTimeout = 300_000;
    }
    return config;
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
  /** ~32MB; precache hurts install and bust query (?v=) missed default ignore rules → bad SW routing. */
  publicExcludes: ["!noprecache/**/*", "!Final-nywele.glb"],
  /** User rules first: GLB must not use the catch-all "pages" NetworkFirst handler. */
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    ignoreURLParametersMatching: [/^utm_/, /^fbclid$/, /^v$/],
    runtimeCaching: [
      {
        urlPattern: /\.glb($|\?)/i,
        handler: "NetworkOnly",
      },
    ],
  },
  fallbacks: {
    document: "/offline",
  },
});

export default withPWAWrap(nextConfig);
