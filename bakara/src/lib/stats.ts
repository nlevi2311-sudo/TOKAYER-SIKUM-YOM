import type { CheckEntry } from "@prisma/client";
import { CHECK_ITEMS } from "./checks";
import { addDays } from "./time";

export type ItemStats = {
  key: string;
  label: string;
  total: number;
  done: number;
  notDone: number;
  needsCare: number;
  na: number;
  independent: number;
  reminder: number;
  assisted: number;
};

export function itemStats(entries: CheckEntry[]): ItemStats[] {
  return CHECK_ITEMS.map((i) => {
    const es = entries.filter((e) => e.itemKey === i.key);
    const c = (f: (e: CheckEntry) => boolean) => es.filter(f).length;
    return {
      key: i.key,
      label: i.label,
      total: es.length,
      done: c((e) => e.status === "DONE"),
      notDone: c((e) => e.status === "NOT_DONE"),
      needsCare: c((e) => e.status === "NEEDS_CARE"),
      na: c((e) => e.status === "NA"),
      independent: c((e) => e.independence === "INDEPENDENT"),
      reminder: c((e) => e.independence === "REMINDER"),
      assisted: c((e) => e.independence === "ASSISTED"),
    };
  }).filter((s) => s.total > 0);
}

/** אחוז העצמאות מתוך הבדיקות שבוצעו ושיש להן מדד עצמאות */
export function independencePct(entries: CheckEntry[]): number | null {
  const rated = entries.filter((e) => e.status === "DONE" && e.independence && e.independence !== "NONE");
  if (!rated.length) return null;
  return Math.round((rated.filter((e) => e.independence === "INDEPENDENT").length / rated.length) * 100);
}

export function weekStart(date: string): string {
  const day = new Date(`${date}T12:00:00Z`).getUTCDay();
  return addDays(date, -day);
}

export function weeklyTrend(entries: CheckEntry[]) {
  const weeks = new Map<string, CheckEntry[]>();
  for (const e of entries) {
    const w = weekStart(e.date);
    weeks.set(w, [...(weeks.get(w) ?? []), e]);
  }
  return [...weeks.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, es]) => ({
      week,
      independent: independencePct(es),
      reminders: es.filter((e) => e.independence === "REMINDER" || e.independence === "ASSISTED").length,
      notDone: es.filter((e) => e.status === "NOT_DONE" || e.status === "NEEDS_CARE").length,
      total: es.length,
    }));
}

export function completion(entries: CheckEntry[]) {
  const done = entries.filter((e) => e.status === "DONE" || e.status === "NA").length;
  return entries.length ? Math.round((done / entries.length) * 100) : null;
}
