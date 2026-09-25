import "server-only";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { createPublicClient } from "@/lib/supabase/server";
import {
  defaultPublicContent,
  mergeContent,
  PUBLIC_CONTENT_KEYS,
  type PublicContent,
} from "@/config/public-content";

/**
 * התוכן הציבורי: ברירות המחדל מ-config/public-content.ts,
 * ומעליהן מה שנערך בממשק הניהול. אם בסיס הנתונים לא זמין, האתר ממשיך לעבוד עם ברירות המחדל.
 */
export const getPublicContent = cache(async (): Promise<PublicContent> => {
  if (!isSupabaseConfigured()) return defaultPublicContent;

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.from("public_content").select("key, value");
    if (error || !data) return defaultPublicContent;

    const stored = new Map(data.map((row) => [row.key, row.value]));
    const result = { ...defaultPublicContent };
    for (const key of PUBLIC_CONTENT_KEYS) {
      if (stored.has(key)) {
        (result as Record<string, unknown>)[key] = mergeContent(key, stored.get(key));
      }
    }
    return result;
  } catch {
    return defaultPublicContent;
  }
});
