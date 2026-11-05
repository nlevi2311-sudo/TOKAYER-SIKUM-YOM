"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { MANUAL_INCIDENT } from "@/lib/checks";
import { parseLocalDateTime } from "@/lib/time";
import { getMyOpenShift } from "@/lib/shift";

type Result = { error?: string; ok?: boolean } | null;

export async function addExceptionUpdateAction(_prev: Result, formData: FormData): Promise<Result> {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const text = String(formData.get("text") ?? "").trim();
  const followup = formData.get("followup") === "on";
  const recheck = String(formData.get("recheckAt") ?? "");
  const handler = String(formData.get("handler") ?? "").trim();
  if (text.length < 3) return { error: "יש לכתוב מה נעשה או מה המצב" };
  const ex = await db.exception.findUnique({ where: { id } });
  if (!ex || ex.status === "CLOSED") return { error: "החריגה לא נמצאה או כבר נסגרה" };
  const recheckAt = followup ? parseLocalDateTime(recheck) : null;
  if (followup && !recheckAt) return { error: "יש לקבוע מתי לבצע בדיקה חוזרת" };
  const shift = await getMyOpenShift(user.id);
  await db.exceptionUpdate.create({ data: { exceptionId: id, userId: user.id, shiftId: shift?.id ?? null, text } });
  await db.exception.update({
    where: { id },
    data: {
      ...(followup ? { status: "FOLLOWUP", needsFollowup: true, recheckAt } : {}),
      ...(handler ? { handler } : {}),
    },
  });
  await audit(user.id, "EXCEPTION_UPDATE", "Exception", id, { text, followup });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function closeExceptionAction(_prev: Result, formData: FormData): Promise<Result> {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const note = String(formData.get("closureNote") ?? "").trim();
  if (note.length < 5) return { error: "אי אפשר לסגור חריגה בלי לתעד איך היא טופלה" };
  const ex = await db.exception.findUnique({ where: { id } });
  if (!ex || ex.status === "CLOSED") return { error: "החריגה לא נמצאה או כבר נסגרה" };
  if (!ex.actionsTaken.trim() || !ex.handler.trim()) return { error: "חסר תיעוד בחריגה עצמה (מה נעשה, מי מטפל)" };
  const shift = await getMyOpenShift(user.id);
  await db.exceptionUpdate.create({
    data: { exceptionId: id, userId: user.id, shiftId: shift?.id ?? null, text: `נסגרה: ${note}` },
  });
  await db.exception.update({
    where: { id },
    data: { status: "CLOSED", closedById: user.id, closedAt: new Date(), closureNote: note },
  });
  await audit(user.id, "EXCEPTION_CLOSE", "Exception", id, { note });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function createIncidentAction(_prev: Result, formData: FormData): Promise<Result> {
  const user = await requireUser(["DUTY", "ADMIN"]);
  const shift = await getMyOpenShift(user.id);
  if (!shift) return { error: "צריך משמרת פתוחה כדי לפתוח אירוע חריג" };
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const childId = get("childId");
  const fields = {
    whatHappened: get("whatHappened"),
    reason: get("reason"),
    actionsTaken: get("actionsTaken"),
    handler: get("handler"),
  };
  if (!childId) return { error: "יש לבחור ילד" };
  if (Object.values(fields).some((v) => !v)) return { error: "יש למלא: מה קרה, סיבה, מה נעשה ומי מטפל" };
  const needsFollowup = formData.get("needsFollowup") === "on";
  const recheckAt = needsFollowup ? parseLocalDateTime(get("recheckAt")) : null;
  if (needsFollowup && !recheckAt) return { error: "יש לקבוע מתי לבצע בדיקה חוזרת" };
  const ex = await db.exception.create({
    data: {
      childId,
      date: shift.date,
      itemKey: MANUAL_INCIDENT,
      shiftId: shift.id,
      openedById: user.id,
      ...fields,
      needsFollowup,
      recheckAt,
      notifyDirector: formData.get("notifyDirector") === "on",
      notifyOther: get("notifyOther"),
      status: needsFollowup ? "FOLLOWUP" : "OPEN",
    },
  });
  await audit(user.id, "INCIDENT_OPEN", "Exception", ex.id, { childId });
  revalidatePath("/", "layout");
  redirect(`/exceptions/${ex.id}`);
}
