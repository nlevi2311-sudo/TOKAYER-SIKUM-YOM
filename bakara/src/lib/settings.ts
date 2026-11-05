import "server-only";
import bcrypt from "bcryptjs";
import { db } from "./db";

export type Mode = "demo" | "real";
export const DEMO_PASSWORD = "demo1234";

export async function getMode(): Promise<Mode> {
  const s = await db.setting.findUnique({ where: { key: "mode" } });
  return s?.value === "real" ? "real" : "demo";
}

export async function setMode(mode: Mode) {
  await db.setting.upsert({ where: { key: "mode" }, create: { key: "mode", value: mode }, update: { value: mode } });
}

/** משתמשים פעילים שעדיין עם סיסמת הדמה. כל עוד יש כאלה, אסור לייבא נתונים אמיתיים. */
export async function usersWithDemoPassword() {
  const users = await db.user.findMany({ where: { active: true } });
  const out: { id: string; username: string; fullName: string }[] = [];
  for (const u of users) {
    if (await bcrypt.compare(DEMO_PASSWORD, u.passwordHash)) out.push({ id: u.id, username: u.username, fullName: u.fullName });
  }
  return out;
}
