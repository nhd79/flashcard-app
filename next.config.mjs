/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Fix webpack caching issues on Windows
    if (!isServer) {
      config.cache = {
        type: "memory",
      };
    }

    // Add fallbacks for node modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },
  // Fix file watching issues on Windows
  experimental: {
    // Disable webpack cache for development to avoid cache issues
    webpackBuildWorker: false,
  },
};

export default nextConfig;
