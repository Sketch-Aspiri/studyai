import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["react-markdown", "remark-gfm"],
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
}

export default nextConfig
