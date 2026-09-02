/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@repo/shared"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

module.exports = nextConfig;
