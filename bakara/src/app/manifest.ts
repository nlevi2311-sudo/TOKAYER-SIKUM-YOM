import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "טוקאייר · בקרת מנהל תורן",
    short_name: "טוקאייר",
    start_url: "/",
    display: "standalone",
    background_color: "#f1f5f9",
    theme_color: "#1c6c84",
    lang: "he",
    dir: "rtl",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
