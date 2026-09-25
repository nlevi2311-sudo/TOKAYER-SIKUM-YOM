/** כלי טקסט לחיפוש בעברית. משמשים גם בשרת (מצב הדגמה) וגם בסינון מקומי בדפדפן. */

const FINAL_LETTERS: Record<string, string> = { ך: "כ", ם: "מ", ן: "נ", ף: "פ", ץ: "צ" };

export function normalizeHebrew(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[֑-ׇ]/g, "") // ניקוד וטעמים
    .replace(/[ךםןףץ]/g, (ch) => FINAL_LETTERS[ch] ?? ch)
    .replace(/["'״׳\-־]/g, "")
    .toLowerCase()
    .trim();
}

/** "בריחה" -> "בריח", כדי למצוא גם "בריחת" */
export function stemOf(term: string): string {
  const t = normalizeHebrew(term);
  return t.length >= 4 ? t.slice(0, -1) : t;
}

/**
 * ציון התאמה פשוט בין 0 ל-1.
 * התאמה מלאה בכותרת > הכלה בכותרת > מילת מפתח > תיאור.
 */
export function matchScore(
  query: string,
  fields: { title: string; keywords?: string[]; description?: string | null; extra?: Array<string | null | undefined> },
): number {
  const q = normalizeHebrew(query);
  if (!q) return 0;
  const stem = stemOf(q);
  const title = normalizeHebrew(fields.title);
  if (title === q) return 1;
  if (title.includes(q)) return 0.95;
  if (title.includes(stem)) return 0.9;
  if ((fields.keywords ?? []).some((k) => normalizeHebrew(k).startsWith(stem))) return 0.85;
  if (fields.description && normalizeHebrew(fields.description).includes(stem)) return 0.5;
  if ((fields.extra ?? []).some((e) => e && normalizeHebrew(e).includes(stem))) return 0.45;
  return 0;
}

export function matchesQuery(query: string, ...haystack: Array<string | null | undefined | string[]>): boolean {
  const stem = stemOf(query);
  if (!stem) return true;
  return haystack.some((h) => {
    if (!h) return false;
    if (Array.isArray(h)) return h.some((x) => normalizeHebrew(x).includes(stem));
    return normalizeHebrew(h).includes(stem);
  });
}

/** tel: נקי מתוך מספר טלפון */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^0-9+]/g, "")}`;
}

export function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export function isPlaceholderUrl(url: string | null | undefined): boolean {
  return !url || url.includes("example.com");
}

const dateFormatter = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jerusalem" });
const shortDateFormatter = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "numeric", year: "2-digit", timeZone: "Asia/Jerusalem" });

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  return dateFormatter.format(typeof value === "string" ? new Date(value) : value);
}

export function formatShortDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  return shortDateFormatter.format(typeof value === "string" ? new Date(value) : value);
}

export function formatRelative(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "עכשיו";
  if (minutes < 60) return `לפני ${minutes} דק׳`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? "לפני שעה" : `לפני ${hours} שעות`;
  const days = Math.round(hours / 24);
  if (days === 1) return "אתמול";
  if (days < 7) return `לפני ${days} ימים`;
  return formatDate(date);
}
