import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["api.adil-baba.com", "shippo-static-v2.s3.amazonaws.com"],
  },
}

export default nextConfig


