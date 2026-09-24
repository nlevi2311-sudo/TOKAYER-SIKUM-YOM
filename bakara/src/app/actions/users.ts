"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { DEMO_PASSWORD } from "@/lib/settings";

type Result = { error?: string; ok?: string } | null;
const ROLES = ["ADMIN", "DIRECTOR", "DUTY"];

export async function saveUserAction(_prev: Result, formData: FormData): Promise<Result> {
  const admin = await requireUser(["ADMIN"]);
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const id = get("id");
  const username = get("username").toLowerCase();
  const fullName = get("fullName");
  const role = get("role");
  const password = get("password");
  const active = formData.get("active") === "on";
  if (!fullName) return { error: "חסר שם" };
  if (!ROLES.includes(role)) return { error: "תפקיד לא תקין" };
  if (password && password.length < 8) return { error: "סיסמה צריכה להיות באורך 8 תווים לפחות" };
  if (password === DEMO_PASSWORD) return { error: "אי אפשר להשתמש בסיסמת הדמה" };
  if (id) {
    if (id === admin.id && (!active || role !== "ADMIN")) return { error: "אי אפשר להוריד לעצמך הרשאת מנהל מערכת" };
    await db.user.update({
      where: { id },
      data: { fullName, role, active, ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {}) },
    });
    if (id !== admin.id && (!active || password)) await db.session.deleteMany({ where: { userId: id } });
    await audit(admin.id, "USER_UPDATE", "User", id, { fullName, role, active, passwordChanged: !!password });
    revalidatePath("/admin/users");
    return { ok: "נשמר" };
  }
  if (!/^[a-z0-9._-]{3,}$/.test(username)) return { error: "שם משתמש: לפחות 3 תווים באנגלית, ספרות או . _ -" };
  if (!password) return { error: "חובה לקבוע סיסמה" };
  if (await db.user.findUnique({ where: { username } })) return { error: "שם המשתמש כבר קיים" };
  const u = await db.user.create({ data: { username, fullName, role, passwordHash: await bcrypt.hash(password, 10) } });
  await audit(admin.id, "USER_CREATE", "User", u.id, { username, role });
  revalidatePath("/admin/users");
  return { ok: "המשתמש נוצר" };
}
