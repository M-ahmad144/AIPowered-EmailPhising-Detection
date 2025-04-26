/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["tailwindcss.com"],
    dangerouslyAllowSVG: true,
  },
  experimental: {
    optimizePackageImports: ["@tailwindcss/postcss", "@tailwindcss/typography"],
  },
  webpack: (config) => {
    config.module.rules.forEach((rule) => {
      if (rule.oneOf) {
        rule.oneOf.forEach((oneOf) => {
          if (oneOf.use?.loader?.includes("postcss-loader")) {
            oneOf.use.options.postcssOptions.plugins = [
              "tailwindcss",
              "autoprefixer",
              ...(oneOf.use.options.postcssOptions.plugins || []),
            ];
          }
        });
      }
    });
    return config;
  },
};

export default nextConfig;
