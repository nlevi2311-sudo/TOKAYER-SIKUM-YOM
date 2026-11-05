"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { seedDemo } from "@/lib/demo-seed";
import { getMode } from "@/lib/settings";

/** מוחק הכל וטוען נתוני דמה חדשים לתאריך של היום. כל המשתמשים מתנתקים. */
export async function resetDemoAction() {
  await requireUser(["ADMIN"]);
  // אחרי ייבוא נתונים אמיתיים אסור למחוק הכל
  if ((await getMode()) === "real") redirect("/admin/users");
  await seedDemo(db, () => {});
  redirect("/login?reset=1");
}
