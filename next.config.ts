import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  allowedDevOrigins: [
    "10.51.104.242",
    "10.51.104.242:3000",
    "localhost",
    "localhost:3000",
    "*.loca.lt",
    "*.trycloudflare.com",
    "*.ngrok-free.app",
  ],
  serverExternalPackages: [
    "chromadb",
    "@chroma-core/ai-embeddings-common",
    "@chroma-core/default-embed",
    "@huggingface/transformers",
    "pdf2json",
  ],
};

export default nextConfig;