import type { NextConfig } from "next";
const productionApiOrigin = "https://fr3shu-go-backend-api.onrender.com";
function validApiOrigin(value: string | undefined) {
  try {
    const parsed = new URL((value ?? "").trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.origin : "";
  } catch {
    return "";
  }
}
const goApiOrigin = validApiOrigin(process.env.NEXT_PUBLIC_GO_API_URL) || (process.env.NODE_ENV === "production" ? productionApiOrigin : "");
const nextConfig: NextConfig = {
  images: { remotePatterns: [] },
  async rewrites() {
    return goApiOrigin ? [{ source: "/api/v1/:path*", destination: `${goApiOrigin}/api/v1/:path*` }] : [];
  },
};
export default nextConfig;
