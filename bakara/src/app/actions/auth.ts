"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { audit } from "@/lib/audit";

export async function loginAction(_prev: { error?: string } | null, formData: FormData) {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) return { error: "יש למלא שם משתמש וסיסמה" };
  const user = await db.user.findUnique({ where: { username } });
  if (!user || !user.active || !(await bcrypt.compare(password, user.passwordHash))) {
    await audit(user?.id ?? null, "LOGIN_FAILED", "User", user?.id ?? "", { username });
    return { error: "שם משתמש או סיסמה שגויים" };
  }
  await createSession(user.id);
  await audit(user.id, "LOGIN", "User", user.id);
  redirect("/");
}
