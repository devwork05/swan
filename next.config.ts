import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  // trailingSlash: true,
  reactStrictMode: false,
    images: {
      unoptimized: true,
      localPatterns: [
        {
          pathname: "res.cloudinary.com",
        },
      ],
    },
};

export default nextConfig;
