"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { seedDemo } from "@/lib/demo-seed";

/** מוחק הכל וטוען נתוני דמה חדשים לתאריך של היום. כל המשתמשים מתנתקים. */
export async function resetDemoAction() {
  await requireUser(["ADMIN"]);
  await seedDemo(db, () => {});
  redirect("/login?reset=1");
}
