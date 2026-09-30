import type { Resource } from "@/types";

/** קישור פנימי נפתח באותו חלון. חיצוני עובר דרך /staff/open כדי להירשם ב"אחרונים" */
export function resourceHref(r: Pick<Resource, "id" | "url">): { href: string; external: boolean } {
  if (r.url.startsWith("/")) return { href: r.url, external: false };
  return { href: `/staff/open/resource/${r.id}`, external: true };
}

export const OPEN_LABEL: Record<Resource["type"], string> = {
  procedure: "פתיחת הנוהל",
  form: "פתיחת הטופס",
  system: "כניסה",
  document: "פתיחה",
  link: "פתיחה",
};
