"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { setMode, usersWithDemoPassword } from "@/lib/settings";

export type ImportRow = {
  fullName: string;
  unit: string;
  age: number;
  hasMedication: boolean;
  bedtime: string;
  notes: string;
};

export async function importChildrenAction(input: { replace: boolean; rows: ImportRow[] }): Promise<{ error?: string; ok?: string }> {
  const user = await requireUser(["ADMIN"]);
  const blockers = await usersWithDemoPassword();
  if (blockers.length) {
    return { error: `לפני ייבוא נתונים אמיתיים צריך להחליף סיסמה ל: ${blockers.map((b) => b.username).join(", ")}` };
  }
  const rows = (input.rows ?? [])
    .map((r) => ({
      fullName: String(r.fullName ?? "").trim().slice(0, 80),
      unit: String(r.unit ?? "").trim().slice(0, 60),
      age: Number.isInteger(r.age) && r.age >= 0 && r.age <= 25 ? r.age : 0,
      hasMedication: !!r.hasMedication,
      bedtime: /^\d{2}:\d{2}$/.test(r.bedtime) ? r.bedtime : "21:30",
      notes: String(r.notes ?? "").trim().slice(0, 1000),
    }))
    .filter((r) => r.fullName && r.unit);
  if (!rows.length) return { error: "לא נמצאו שורות תקינות (צריך לפחות שם וביתן)" };
  if (rows.length > 1000) return { error: "יותר מדי שורות בקובץ" };

  await db.$transaction(async (tx) => {
    if (input.replace) {
      await tx.exceptionUpdate.deleteMany();
      await tx.exception.deleteMany();
      await tx.checkEntry.deleteMany();
      await tx.shift.deleteMany();
      await tx.child.deleteMany();
      await tx.unit.deleteMany();
    }
    const existing = await tx.unit.findMany();
    const unitIds = new Map(existing.map((u) => [u.name, u.id]));
    let order = existing.length;
    for (const name of [...new Set(rows.map((r) => r.unit))]) {
      if (!unitIds.has(name)) {
        const u = await tx.unit.create({ data: { name, sortOrder: order++ } });
        unitIds.set(name, u.id);
      }
    }
    await tx.child.createMany({
      data: rows.map((r) => ({
        fullName: r.fullName,
        unitId: unitIds.get(r.unit)!,
        age: r.age,
        hasMedication: r.hasMedication,
        bedtime: r.bedtime,
        importantNotes: r.notes,
      })),
    });
  });
  await setMode("real");
  // ביומן נרשמת רק כמות, בלי שמות
  await audit(user.id, "CHILDREN_IMPORT", "Child", "", { count: rows.length, replace: input.replace });
  revalidatePath("/", "layout");
  return { ok: `יובאו ${rows.length} ילדים ב-${new Set(rows.map((r) => r.unit)).size} ביתנים` };
}
