import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

const routes: Array<{ path: string; priority: number; changeFrequency: "weekly" | "monthly" }> = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/therapy", priority: 0.8, changeFrequency: "monthly" },
  { path: "/education", priority: 0.8, changeFrequency: "monthly" },
  { path: "/life", priority: 0.7, changeFrequency: "weekly" },
  { path: "/fit", priority: 0.8, changeFrequency: "monthly" },
  { path: "/careers", priority: 0.8, changeFrequency: "weekly" },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");
  const lastModified = new Date();
  return routes.map((route) => ({
    url: route.path === "/" ? base : `${base}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
