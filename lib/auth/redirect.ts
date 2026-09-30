/** מונע open redirect: מאפשר רק נתיבים פנימיים באזור הצוות והניהול */
export function safeNextPath(next: string | null | undefined, fallback = "/staff"): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  if (!/^\/(staff|admin)(\/|\?|$)/.test(next)) return fallback;
  return next;
}
