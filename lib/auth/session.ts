import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { isDemoMode, isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { DEMO_USER } from "@/lib/demo/user";
import type { SessionUser } from "@/types";

function firstNameOf(fullName: string, email: string): string {
  const name = fullName.trim();
  if (name) return name.split(/\s+/)[0];
  return email.split("@")[0];
}

/**
 * המשתמש הנוכחי, מאומת מול Supabase (getUser ולא getSession).
 * מחזיר null אם אין משתמש מחובר. נשמר ב-cache לכל בקשה.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  // בדיקת הרשאה תמיד בזמן הבקשה. אסור שעמוד מוגן ייבנה מראש כעמוד סטטי
  await connection();
  if (isDemoMode()) return DEMO_USER;
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, role, active")
    .eq("id", user.id)
    .maybeSingle();

  const email = profile?.email ?? user.email ?? "";
  const metaName =
    typeof user.user_metadata?.full_name === "string" ? (user.user_metadata.full_name as string) : "";
  const fullName = profile?.full_name ?? metaName ?? "";

  return {
    id: user.id,
    email,
    fullName: fullName || email,
    firstName: firstNameOf(fullName, email),
    avatarUrl: profile?.avatar_url ?? null,
    role: profile?.role ?? "staff",
    active: Boolean(profile?.active),
    isAdmin: Boolean(profile?.active && profile.role === "admin"),
    isDemo: false,
  };
});

/** לשימוש ב-layouts ובעמודים של אזור הצוות */
export async function requireStaff(nextPath = "/staff"): Promise<SessionUser> {
  await connection();
  if (!isSupabaseConfigured() && !isDemoMode()) redirect("/setup");
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  if (!user.active) redirect("/unauthorized");
  return user;
}

/** לשימוש ב-layout של /admin */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireStaff("/admin");
  if (!user.isAdmin) redirect("/staff?denied=admin");
  return user;
}

export class AuthError extends Error {
  constructor(message = "אין הרשאה לביצוע הפעולה") {
    super(message);
    this.name = "AuthError";
  }
}

/** לשימוש ב-server actions: זורק שגיאה במקום redirect */
export async function assertStaff(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user || !user.active) throw new AuthError("צריך להתחבר מחדש");
  return user;
}

export async function assertAdmin(): Promise<SessionUser> {
  const user = await assertStaff();
  if (!user.isAdmin) throw new AuthError();
  return user;
}
