import { DOC_TYPE_LABELS, DOC_TYPES, type DocType } from "@/lib/labels";
import type { ResourceType } from "@/types";

/**
 * טקסטים שמגיעים מקבצי תצורה משותפים עלולים לכלול מקף (למשל "ל-Google").
 * בממשק הניהול מציגים אותם בלי מקפים, לפי כללי הכתיבה של המותג.
 */
export function cleanText(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .replace(/\s[-–—]\s/g, ", ")
    .replace(/([א-ת])[-־](?=\S)/g, "$1 ")
    .replace(/[–—]/g, " ");
}

/** שם רבים לכל סוג משאב, לכותרות ולסינון */
export const RESOURCE_TYPE_PLURALS: Record<ResourceType, string> = {
  system: "מערכות",
  procedure: "נהלים",
  form: "טפסים",
  document: "מסמכים",
  link: "קישורים",
};

export const DOC_TYPE_OPTIONS: Array<{ value: DocType; label: string }> = DOC_TYPES.map((value) => ({
  value,
  label: value === "google_folder" ? "תיקיית Google Drive" : cleanText(DOC_TYPE_LABELS[value]),
}));

/** מערך -> טקסט, שורה לכל פריט */
export function linesToText(lines: readonly string[] | null | undefined): string {
  return (lines ?? []).join("\n");
}

/** טקסט -> מערך, שורות ריקות נזנחות */
export function textToLines(text: string): string[] {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

const pad = (n: number) => String(n).padStart(2, "0");

/** ISO -> ערך לשדה datetime-local, לפי אזור הזמן של הדפדפן */
export function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** ערך datetime-local (שעון מקומי בדפדפן) -> ISO, כדי שהשרת לא יפרש אותו באזור זמן אחר */
export function fromLocalInput(local: string): string {
  if (!local) return "";
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

/** ISO -> YYYY-MM-DD לשדה date */
export function toDateInput(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 10);
}

export const NONE_VALUE = "__none";
