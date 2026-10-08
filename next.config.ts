import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: false,
  // ป้าย route ของ next dev อยู่มุมซ้ายล่างทับปุ่มเครื่องมือทดสอบ (error ยังแสดงตามปกติ)
  devIndicators: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
