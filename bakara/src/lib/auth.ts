import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "node:crypto";
import { db } from "./db";
import type { Role } from "./checks";

export const SESSION_COOKIE = "bakara_session";
/** יציאה אוטומטית אחרי חוסר פעילות */
export const IDLE_MINUTES = 30;
const MAX_SESSION_HOURS = 14;

export type CurrentUser = { id: string; username: string; fullName: string; role: Role };

export async function createSession(userId: string) {
  const id = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + MAX_SESSION_HOURS * 3600_000);
  await db.session.create({ data: { id, userId, expiresAt } });
  const jar = await cookies();
  // עוגייה מאובטחת כשהגישה ב-https. ברשת מקומית (http) עדיין אפשר להתחבר מהטלפון.
  const proto = ((await headers()).get("x-forwarded-proto") ?? "http").split(",")[0].trim();
  jar.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: proto === "https",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const id = jar.get(SESSION_COOKIE)?.value;
  if (id) await db.session.deleteMany({ where: { id } });
  jar.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const jar = await cookies();
  const id = jar.get(SESSION_COOKIE)?.value;
  if (!id) return null;
  const session = await db.session.findUnique({ where: { id }, include: { user: true } });
  if (!session) return null;
  const now = Date.now();
  const idle = now - session.lastActivity.getTime() > IDLE_MINUTES * 60_000;
  if (idle || session.expiresAt.getTime() < now || !session.user.active) {
    await db.session.deleteMany({ where: { id } });
    return null;
  }
  if (now - session.lastActivity.getTime() > 60_000) {
    await db.session.update({ where: { id }, data: { lastActivity: new Date() } });
  }
  const u = session.user;
  return { id: u.id, username: u.username, fullName: u.fullName, role: u.role as Role };
}

/** מחזיר את המשתמש המחובר, או מעביר לכניסה. אם הוגדרו תפקידים, בודק הרשאה. */
export async function requireUser(roles?: Role[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (roles && !roles.includes(user.role)) redirect("/");
  return user;
}

export const can = {
  manageChildren: (u: CurrentUser) => u.role === "ADMIN",
  manageUsers: (u: CurrentUser) => u.role === "ADMIN",
  viewDashboard: (u: CurrentUser) => u.role === "ADMIN" || u.role === "DIRECTOR",
  runShift: (u: CurrentUser) => u.role === "DUTY" || u.role === "ADMIN",
  viewAudit: (u: CurrentUser) => u.role === "ADMIN" || u.role === "DIRECTOR",
};
