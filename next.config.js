/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['i.ytimg.com', 'img.youtube.com', 'vumbnail.com'],
  },
  webpack: (config, { isServer }) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    
    // Exclude React Native packages from both server and client bundles
    if (!isServer) {
      // Client-side fallbacks
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@react-native-async-storage/async-storage': false,
      };
    }
    
    // Add to externals to prevent bundling
    config.externals = config.externals || [];
    if (Array.isArray(config.externals)) {
      config.externals.push('@react-native-async-storage/async-storage');
    } else {
      config.externals = [
        config.externals,
        '@react-native-async-storage/async-storage',
      ];
    }
    
    // Use IgnorePlugin to completely ignore the package
    const webpack = require('webpack');
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^@react-native-async-storage\/async-storage$/,
      })
    );
    
    return config;
  },
}

module.exports = nextConfig


