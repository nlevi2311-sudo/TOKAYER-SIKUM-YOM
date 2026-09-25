import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

/** מטא דאטה אחידה לעמודים הציבוריים, כולל OpenGraph */
export function publicMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
}): Metadata {
  const ogTitle = absoluteTitle ? title : `${title} | ${siteConfig.name}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.fullName,
      title: ogTitle,
      description,
      url: path,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
    },
  };
}
