/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing image config
  images: {
    domains: ["tailwindcss.com"],
    dangerouslyAllowSVG: true,
  },

  // New optimizations for Tailwind
  experimental: {
    optimizePackageImports: ["@tailwindcss/postcss", "@tailwindcss/typography"],
  },

  // Webpack adjustments
  webpack: (config) => {
    // Ensure PostCSS loader includes necessary plugins
    config.module.rules.forEach((rule) => {
      if (rule.oneOf) {
        rule.oneOf.forEach((oneOf) => {
          if (oneOf.use?.loader?.includes("postcss-loader")) {
            oneOf.use.options.postcssOptions.plugins = [
              require("tailwindcss"),
              require("autoprefixer"),
              ...(oneOf.use.options.postcssOptions.plugins || []),
            ];
          }
        });
      }
    });
    return config;
  },
};

module.exports = nextConfig;
