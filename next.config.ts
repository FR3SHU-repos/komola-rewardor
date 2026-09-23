import type { NextConfig } from "next";
const goApiOrigin = process.env.NEXT_PUBLIC_GO_API_URL?.replace(/\/$/, "");
const nextConfig: NextConfig = {
  images: { remotePatterns: [] },
  async rewrites() {
    return goApiOrigin ? [{ source: "/api/v1/:path*", destination: `${goApiOrigin}/api/v1/:path*` }] : [];
  },
};
export default nextConfig;
