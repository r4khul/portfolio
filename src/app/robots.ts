import type { MetadataRoute } from "next";
import { profile } from "@/data/profile";

/**
 * robots.txt
 *
 * Everything public is crawlable. Only the JSON data endpoints are kept out
 * of indexes: they power the UI (view counts, GitHub stats, PR details) and
 * are meaningless as search results.
 *
 * /api/og/* is deliberately NOT disallowed: social crawlers such as Twitterbot
 * honour robots.txt, and blocking it would break the generated share images.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/views", "/api/github", "/api/open-source"],
    },
    sitemap: `${profile.url}/sitemap.xml`,
    host: profile.url,
  };
}
