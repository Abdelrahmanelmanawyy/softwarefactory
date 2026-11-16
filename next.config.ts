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
  // Only for `npm run dev` (the static export uses public/_redirects and the Pages index.html).
  ...(process.env.NODE_ENV === "development" && {
    redirects: async () => [{ source: "/", destination: "/tr", permanent: false }],
  }),
  turbopack: { root: __dirname },
};

export default nextConfig;
