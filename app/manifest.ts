import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/staff",
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: "טוקאייר במקום אחד: מערכות, נהלים, טפסים והדרכות לצוות",
    start_url: "/staff",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "he",
    dir: "rtl",
    background_color: "#ffffff",
    theme_color: siteConfig.theme.themeColor,
    categories: ["productivity", "education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "חיפוש", url: "/staff/search", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "נהלים", url: "/staff/procedures", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "חירום", url: "/staff/emergency", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
