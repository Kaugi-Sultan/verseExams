import type { NextConfig } from "next";
import { resolve } from "node:path";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  outputFileTracingRoot: resolve(process.cwd(), ".."),
  outputFileTracingIncludes: {
    "/*": ["./index.html"],
  },
};

export default nextConfig;
