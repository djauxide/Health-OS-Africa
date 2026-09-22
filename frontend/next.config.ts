import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const configDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  output: "standalone",
  // The workspace installs dependencies in the monorepo root. Include that
  // directory in tracing so the standalone runner contains Next.js itself.
  outputFileTracingRoot: path.resolve(configDir, "..")
};

export default nextConfig;
