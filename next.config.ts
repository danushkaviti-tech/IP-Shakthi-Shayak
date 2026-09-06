import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "chromadb",
    "@chroma-core/ai-embeddings-common",
  ],

  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;