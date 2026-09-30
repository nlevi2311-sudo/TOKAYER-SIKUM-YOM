import "server-only";
import { cookies } from "next/headers";

/**
 * מועדפים ופריטים אחרונים במצב הדגמה נשמרים ב-cookie של הדפדפן,
 * כדי שההדגמה תעבוד גם בלי בסיס נתונים. בפרודקשן הם נשמרים ב-Supabase.
 */
const FAVORITES_COOKIE = "demo_favorites";
const RECENT_COOKIE = "demo_recent";
const MAX_AGE = 60 * 60 * 24 * 30;

export type DemoKey = `${"resource" | "training"}:${string}`;
export type DemoRecent = { key: DemoKey; at: string };

function parse<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function getDemoFavorites(): Promise<DemoKey[]> {
  const store = await cookies();
  const value = parse<unknown>(store.get(FAVORITES_COOKIE)?.value, []);
  return Array.isArray(value) ? value.filter((v): v is DemoKey => typeof v === "string") : [];
}

export async function toggleDemoFavorite(key: DemoKey): Promise<boolean> {
  const store = await cookies();
  const current = await getDemoFavorites();
  const exists = current.includes(key);
  const next = exists ? current.filter((k) => k !== key) : [key, ...current].slice(0, 100);
  store.set(FAVORITES_COOKIE, JSON.stringify(next), { maxAge: MAX_AGE, path: "/", sameSite: "lax" });
  return !exists;
}

export async function getDemoRecent(): Promise<DemoRecent[]> {
  const store = await cookies();
  const value = parse<unknown>(store.get(RECENT_COOKIE)?.value, []);
  if (!Array.isArray(value)) return [];
  return value.filter(
    (v): v is DemoRecent => typeof v === "object" && v !== null && "key" in v && "at" in v,
  );
}

export async function pushDemoRecent(key: DemoKey): Promise<void> {
  const store = await cookies();
  const current = await getDemoRecent();
  const next = [{ key, at: new Date().toISOString() }, ...current.filter((r) => r.key !== key)].slice(0, 20);
  store.set(RECENT_COOKIE, JSON.stringify(next), { maxAge: MAX_AGE, path: "/", sameSite: "lax" });
}
