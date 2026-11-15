import type { NextConfig } from "next";

// The site is fully static (one page per language), exported into ./out.
// - Cloudflare Workers serves it at the domain root ("/" -> "/tr" via public/_redirects).
// - GitHub Pages serves it under /softwarefactory, set via PAGES_BASE_PATH in the workflow.
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: false,
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  turbopack: { root: __dirname },
};

export default nextConfig;
