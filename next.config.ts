import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Blog featured images stay on the WordPress install, which is still the
    // CMS. Without this next/image refuses the host and the blog throws.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "techbuzz.com.pk",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
  async redirects() {
    return [
      // Keep the old techbuzz.com.pk/pricings URL working.
      { source: "/pricings", destination: "/pricing", permanent: true },
      { source: "/pricings/", destination: "/pricing", permanent: true },
    ];
  },
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
