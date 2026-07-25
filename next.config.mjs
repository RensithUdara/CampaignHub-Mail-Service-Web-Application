/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    unoptimized: !process.env.VERCEL,
  },
};

export default nextConfig;
