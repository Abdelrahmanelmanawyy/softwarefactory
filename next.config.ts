import type { NextConfig } from "next";

// The site is fully static (one page per language), so it is exported as plain
// HTML/CSS/JS into ./out and served by Cloudflare Workers static assets.
// The "/" -> "/tr" redirect lives in public/_redirects (Turkish is the default).
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: false,
  turbopack: { root: __dirname },
};

export default nextConfig;
