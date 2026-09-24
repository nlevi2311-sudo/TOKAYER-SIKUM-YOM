"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";

type Result = { error?: string } | null;

export async function saveChildAction(_prev: Result, formData: FormData): Promise<Result> {
  const user = await requireUser(["ADMIN"]);
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const id = get("id");
  const data = {
    fullName: get("fullName"),
    unitId: get("unitId"),
    age: Number(get("age")),
    present: formData.get("present") === "on",
    importantNotes: get("importantNotes"),
    hasMedication: formData.get("hasMedication") === "on",
    medicationNotes: get("medicationNotes"),
    bedtime: get("bedtime") || "21:30",
    familyContact: formData.get("familyContact") === "on",
    extraInfo: get("extraInfo"),
    active: formData.get("active") !== "off",
  };
  if (!data.fullName) return { error: "חסר שם" };
  if (!data.unitId) return { error: "יש לבחור ביתן" };
  if (!Number.isInteger(data.age) || data.age < 3 || data.age > 25) return { error: "גיל לא תקין" };
  if (!/^\d{2}:\d{2}$/.test(data.bedtime)) return { error: "שעת שינה לא תקינה" };
  if (id) {
    const before = await db.child.findUnique({ where: { id } });
    await db.child.update({ where: { id }, data });
    await audit(user.id, "CHILD_UPDATE", "Child", id, { before, after: data });
  } else {
    const c = await db.child.create({ data });
    await audit(user.id, "CHILD_CREATE", "Child", c.id, data);
  }
  revalidatePath("/", "layout");
  redirect("/children");
}
