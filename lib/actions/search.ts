"use server";

import { assertStaff, AuthError } from "@/lib/auth/session";
import { searchAll, searchResultHref } from "@/lib/data/staff";
import type { SearchResult } from "@/types";

export type SearchHit = SearchResult & { href: string; external: boolean };

/** חיפוש מהיר לתיבת החיפוש ולחלון Ctrl+K */
export async function searchAction(query: string): Promise<{ ok: true; results: SearchHit[] } | { ok: false; error: string }> {
  if (typeof query !== "string") return { ok: false, error: "חיפוש לא תקין" };
  try {
    await assertStaff();
    const results = await searchAll(query, 12);
    return {
      ok: true,
      results: results.map((r) => {
        const href = searchResultHref(r);
        return { ...r, href, external: href.startsWith("/staff/open/") && !r.url.startsWith("/") };
      }),
    };
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, error: e.message };
    console.error("[searchAction]", e);
    return { ok: false, error: "החיפוש נכשל. נסו שוב." };
  }
}
