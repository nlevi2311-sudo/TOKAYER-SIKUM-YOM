"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { DEMO_PASSWORD } from "@/lib/settings";

type Result = { error?: string; ok?: string } | null;

export async function changePasswordAction(_prev: Result, formData: FormData): Promise<Result> {
  const user = await requireUser();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const again = String(formData.get("again") ?? "");
  const u = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!(await bcrypt.compare(current, u.passwordHash))) return { error: "הסיסמה הנוכחית לא נכונה" };
  if (next.length < 8) return { error: "הסיסמה החדשה צריכה להיות באורך 8 תווים לפחות" };
  if (next === DEMO_PASSWORD) return { error: "אי אפשר להשתמש בסיסמת הדמה" };
  if (next !== again) return { error: "שתי הסיסמאות החדשות לא זהות" };
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(next, 10) } });
  await audit(user.id, "PASSWORD_CHANGE", "User", user.id);
  return { ok: "הסיסמה הוחלפה" };
}
