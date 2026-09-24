"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { ITEM_BY_KEY, SHIFT_TYPES, CheckStatus, Independence } from "@/lib/checks";
import { nowIL, parseLocalDateTime } from "@/lib/time";
import { shiftCloseIssues } from "@/lib/engine";
import { buildShiftSummary } from "@/lib/summary";
import { getMyOpenShift } from "@/lib/shift";

export async function openShiftAction(formData: FormData) {
  const user = await requireUser(["DUTY", "ADMIN"]);
  const type = String(formData.get("type") ?? "");
  if (!SHIFT_TYPES.some((s) => s.key === type)) redirect("/shift?error=type");
  const existing = await getMyOpenShift(user.id);
  if (existing) redirect("/shift");
  const shift = await db.shift.create({ data: { managerId: user.id, type, date: nowIL().date } });
  await audit(user.id, "SHIFT_OPEN", "Shift", shift.id, { type, date: shift.date });
  revalidatePath("/", "layout");
  redirect("/shift");
}

export type ExceptionInput = {
  whatHappened: string;
  reason: string;
  actionsTaken: string;
  handler: string;
  needsFollowup: boolean;
  recheckAt: string;
  notifyDirector: boolean;
  notifyOther: string;
  resolvedNow: boolean;
  closureNote: string;
};

export type SaveCheckInput = {
  childId: string;
  itemKey: string;
  status: CheckStatus;
  independence?: Independence | null;
  exception?: ExceptionInput | null;
};

function validateException(ex: ExceptionInput | null | undefined): string | null {
  if (!ex) return "חובה לתעד את החריגה";
  const required: [keyof ExceptionInput, string][] = [
    ["whatHappened", "מה קרה"],
    ["reason", "מה הסיבה"],
    ["actionsTaken", "מה נעשה עד עכשיו"],
    ["handler", "מי מטפל"],
  ];
  const missing = required.filter(([k]) => !String(ex[k] ?? "").trim()).map(([, l]) => l);
  if (missing.length) return `חסר תיעוד: ${missing.join(", ")}`;
  if (ex.needsFollowup && !ex.recheckAt) return "סומן שצריך מעקב. חובה לקבוע מתי לבצע בדיקה חוזרת";
  if (ex.resolvedNow && ex.closureNote.trim().length < 3) return "כדי לסגור מיד צריך לכתוב איך זה טופל";
  return null;
}

export async function saveCheckAction(input: SaveCheckInput): Promise<{ error?: string }> {
  const user = await requireUser(["DUTY", "ADMIN"]);
  const shift = await getMyOpenShift(user.id);
  if (!shift) return { error: "אין משמרת פתוחה. יש לפתוח משמרת לפני ביצוע בקרה" };
  const item = ITEM_BY_KEY[input.itemKey];
  if (!item) return { error: "תחום לא מוכר" };
  if (!["DONE", "NOT_DONE", "NA", "NEEDS_CARE"].includes(input.status)) return { error: "סטטוס לא תקין" };
  const child = await db.child.findUnique({ where: { id: input.childId } });
  if (!child || !child.active) return { error: "ילד לא נמצא" };

  let independence: string | null = null;
  if (item.independence) {
    if (input.status === "DONE") {
      if (!input.independence || input.independence === "NONE") return { error: "יש לסמן איך בוצע: עצמאית, אחרי תזכורת או אחרי ליווי" };
      independence = input.independence;
    } else if (input.status === "NOT_DONE") independence = "NONE";
  }

  const date = shift.date;
  const isProblem = input.status === "NOT_DONE" || input.status === "NEEDS_CARE";
  const activeEx = isProblem
    ? await db.exception.findFirst({
        where: { childId: child.id, date, itemKey: item.key, status: { not: "CLOSED" } },
      })
    : null;

  if (isProblem && !activeEx) {
    const err = validateException(input.exception);
    if (err) return { error: err };
  }

  const prev = await db.checkEntry.findUnique({ where: { date_childId_itemKey: { date, childId: child.id, itemKey: item.key } } });
  const entry = await db.checkEntry.upsert({
    where: { date_childId_itemKey: { date, childId: child.id, itemKey: item.key } },
    create: { date, childId: child.id, itemKey: item.key, status: input.status, independence, shiftId: shift.id, updatedById: user.id },
    update: { status: input.status, independence, shiftId: shift.id, updatedById: user.id },
  });
  await audit(user.id, prev ? "CHECK_UPDATE" : "CHECK_SET", "CheckEntry", entry.id, {
    child: child.fullName,
    item: item.label,
    from: prev ? { status: prev.status, independence: prev.independence } : null,
    to: { status: input.status, independence },
  });

  if (isProblem && !activeEx && input.exception) {
    const ex = input.exception;
    const recheckAt = ex.needsFollowup ? parseLocalDateTime(ex.recheckAt) : null;
    const status = ex.resolvedNow ? "CLOSED" : ex.needsFollowup ? "FOLLOWUP" : "OPEN";
    const created = await db.exception.create({
      data: {
        childId: child.id,
        date,
        itemKey: item.key,
        shiftId: shift.id,
        openedById: user.id,
        whatHappened: ex.whatHappened.trim(),
        reason: ex.reason.trim(),
        actionsTaken: ex.actionsTaken.trim(),
        handler: ex.handler.trim(),
        needsFollowup: ex.needsFollowup,
        recheckAt,
        notifyDirector: ex.notifyDirector,
        notifyOther: ex.notifyOther.trim(),
        status,
        closedById: ex.resolvedNow ? user.id : null,
        closedAt: ex.resolvedNow ? new Date() : null,
        closureNote: ex.resolvedNow ? ex.closureNote.trim() : "",
      },
    });
    await audit(user.id, "EXCEPTION_OPEN", "Exception", created.id, { child: child.fullName, item: item.label, status });
  }

  revalidatePath("/shift");
  revalidatePath(`/shift/child/${child.id}`);
  return {};
}

export async function clearCheckAction(childId: string, itemKey: string): Promise<{ error?: string }> {
  const user = await requireUser(["DUTY", "ADMIN"]);
  const shift = await getMyOpenShift(user.id);
  if (!shift) return { error: "אין משמרת פתוחה" };
  const entry = await db.checkEntry.findUnique({ where: { date_childId_itemKey: { date: shift.date, childId, itemKey } } });
  if (!entry) return {};
  await db.checkEntry.delete({ where: { id: entry.id } });
  await audit(user.id, "CHECK_CLEAR", "CheckEntry", entry.id, { childId, itemKey, was: entry.status });
  revalidatePath("/shift");
  revalidatePath(`/shift/child/${childId}`);
  return {};
}

export async function setPresenceAction(childId: string, present: boolean) {
  const user = await requireUser();
  const child = await db.child.update({ where: { id: childId }, data: { present } });
  await audit(user.id, "CHILD_PRESENCE", "Child", childId, { child: child.fullName, present });
  revalidatePath("/", "layout");
}

export async function closeShiftAction(formData: FormData) {
  const user = await requireUser(["DUTY", "ADMIN"]);
  if (!can.runShift(user)) redirect("/");
  const shift = await getMyOpenShift(user.id);
  if (!shift) redirect("/shift");
  const issues = await shiftCloseIssues(shift);
  if (issues.total > 0) {
    await audit(user.id, "SHIFT_CLOSE_BLOCKED", "Shift", shift.id, { total: issues.total });
    redirect("/shift/close?blocked=1");
  }
  const handoffNotes = String(formData.get("handoffNotes") ?? "").trim();
  const nextTasks = String(formData.get("nextTasks") ?? "").trim();
  await db.shift.update({ where: { id: shift.id }, data: { handoffNotes, nextTasks } });
  const endedAt = new Date();
  const summary = await buildShiftSummary(db, shift.id, endedAt);
  await db.shift.update({
    where: { id: shift.id },
    data: { status: "CLOSED", endedAt, summaryJson: JSON.stringify(summary) },
  });
  await audit(user.id, "SHIFT_CLOSE", "Shift", shift.id, { type: shift.type });
  revalidatePath("/", "layout");
  redirect(`/shifts/${shift.id}?closed=1`);
}
