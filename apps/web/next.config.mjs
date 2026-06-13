/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@gsmaxall/ui",
    "@gsmaxall/sdk",
    "@gsmaxall/shared",
    "@gsmaxall/types",
  ],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "www.gsgroups.net" }],
  },
};

export default nextConfig;
