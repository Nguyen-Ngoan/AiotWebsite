import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    // Không dùng Image Optimizer nữa, <Image> sẽ render <img> thường
    unoptimized: true,
  },
};

export default nextConfig;
