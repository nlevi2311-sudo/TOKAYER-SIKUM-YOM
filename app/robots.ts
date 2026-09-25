import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.url.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/staff", "/admin", "/api", "/auth", "/login", "/unauthorized", "/setup"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
