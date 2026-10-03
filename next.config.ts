import type { NextConfig } from "next";

/**
 * Static export configuration for GitHub Pages deployment.
 *
 * Set BASE_PATH env var if you need to deploy to a sub-path
 * (e.g. https://username.github.io/zmovie/ → BASE_PATH=/zmovie)
 *
 * For root deployment (repo named "username.github.io"), leave BASE_PATH empty.
 */
const basePath = process.env.BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  // Disable image optimization (not supported in static export)
  images: {
    unoptimized: true,
  },
  // Disable TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // For GitHub Pages sub-path deployment (e.g. /repo-name/)
  ...(basePath && { basePath, assetPrefix: basePath }),
  // Add trailing slashes for better GitHub Pages compatibility
  trailingSlash: true,
  poweredByHeader: false,
};

export default nextConfig;
