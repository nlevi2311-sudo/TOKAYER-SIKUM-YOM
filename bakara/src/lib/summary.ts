import type { PrismaClient } from "@prisma/client";
import { itemLabel, shiftLabel } from "./checks";

export type ShiftSummary = {
  manager: string;
  type: string;
  date: string;
  startedAt: string;
  endedAt: string;
  present: number;
  childrenTouched: number;
  entries: Record<string, number>;
  independence: Record<string, number>;
  opened: { child: string; item: string; status: string; what: string }[];
  closedCount: number;
  stillActive: { child: string; item: string; status: string; handler: string }[];
  handoffNotes: string;
  nextTasks: string;
};

/** סיכום אוטומטי למשמרת. נקרא בסגירת משמרת. */
export async function buildShiftSummary(db: PrismaClient, shiftId: string, endedAt: Date): Promise<ShiftSummary> {
  const shift = await db.shift.findUniqueOrThrow({ where: { id: shiftId }, include: { manager: true } });
  const [entries, opened, closedCount, stillActive, present] = await Promise.all([
    db.checkEntry.findMany({ where: { shiftId } }),
    db.exception.findMany({ where: { shiftId }, include: { child: true } }),
    db.exception.count({ where: { closedAt: { gte: shift.startedAt, lte: endedAt } } }),
    db.exception.findMany({ where: { status: { not: "CLOSED" } }, include: { child: true } }),
    db.child.count({ where: { active: true, present: true } }),
  ]);
  const byStatus: Record<string, number> = { DONE: 0, NOT_DONE: 0, NA: 0, NEEDS_CARE: 0 };
  const byInd: Record<string, number> = { INDEPENDENT: 0, REMINDER: 0, ASSISTED: 0 };
  for (const e of entries) {
    byStatus[e.status] = (byStatus[e.status] ?? 0) + 1;
    if (e.independence && e.independence in byInd) byInd[e.independence]++;
  }
  return {
    manager: shift.manager.fullName,
    type: shiftLabel(shift.type),
    date: shift.date,
    startedAt: shift.startedAt.toISOString(),
    endedAt: endedAt.toISOString(),
    present,
    childrenTouched: new Set(entries.map((e) => e.childId)).size,
    entries: byStatus,
    independence: byInd,
    opened: opened.map((e) => ({
      child: e.child.fullName,
      item: itemLabel(e.itemKey),
      status: e.status,
      what: e.whatHappened,
    })),
    closedCount,
    stillActive: stillActive.map((e) => ({
      child: e.child.fullName,
      item: itemLabel(e.itemKey),
      status: e.status,
      handler: e.handler,
    })),
    handoffNotes: shift.handoffNotes,
    nextTasks: shift.nextTasks,
  };
}
