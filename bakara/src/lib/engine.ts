import "server-only";
import type { CheckEntry, Child, Exception, ExceptionUpdate, Shift, Unit, User } from "@prisma/client";
import { db } from "./db";
import {
  CHECK_ITEMS,
  CHECKPOINTS,
  Checkpoint,
  CheckItem,
  dueMinutes,
  isIncidentKey,
  itemApplies,
  itemLabel,
  itemsFor,
  MEAL_KEYS,
  MED_KEYS,
  shiftCheckpoints,
} from "./checks";
import { nowIL } from "./time";

export type Color = "green" | "orange" | "red" | "gray";
export type ChildWithUnit = Child & { unit: Unit };
export type ExceptionFull = Exception & {
  child: ChildWithUnit;
  openedBy: User;
  closedBy: User | null;
  updates: (ExceptionUpdate & { user: User })[];
};

export const ALL_CHECKPOINTS: Checkpoint[] = CHECKPOINTS.map((c) => c.key);

export const exceptionInclude = {
  child: { include: { unit: true } },
  openedBy: true,
  closedBy: true,
  updates: { include: { user: true }, orderBy: { createdAt: "desc" as const } },
};

export async function presentChildren(): Promise<ChildWithUnit[]> {
  return db.child.findMany({
    where: { active: true, present: true },
    include: { unit: true },
    orderBy: [{ unit: { sortOrder: "asc" } }, { fullName: "asc" }],
  });
}

export async function activeExceptions(): Promise<ExceptionFull[]> {
  return db.exception.findMany({
    where: { status: { not: "CLOSED" } },
    include: exceptionInclude,
    orderBy: { openedAt: "desc" },
  });
}

export async function loadDay(date: string) {
  const [children, entries, exceptions] = await Promise.all([
    presentChildren(),
    db.checkEntry.findMany({ where: { date }, include: { updatedBy: true } }),
    activeExceptions(),
  ]);
  return { children, entries, exceptions };
}

export type ChildStatus = {
  child: ChildWithUnit;
  color: Color;
  items: CheckItem[];
  filled: number;
  total: number;
  overdue: CheckItem[];
  missing: CheckItem[];
  openEx: number;
  followEx: number;
  entryByKey: Map<string, CheckEntry>;
};

/**
 * מצב ילד ביחס לנקודות הבקרה הנתונות.
 * אדום = חריגה פתוחה שלא טופלה. כתום = משהו במעקב. אפור = הבדיקה לא הושלמה. ירוק = הכל תקין.
 * mode "due": רק מה שכבר היה צריך להתבצע (למנהל הכפר). mode "all": כל תחומי המשמרת (למנהל תורן).
 */
export function childStatus(
  child: ChildWithUnit,
  entries: CheckEntry[],
  exceptions: Exception[],
  checkpoints: Checkpoint[],
  nowMin: number,
  mode: "all" | "due" = "all",
): ChildStatus {
  const entryByKey = new Map(entries.filter((e) => e.childId === child.id).map((e) => [e.itemKey, e]));
  const items = itemsFor(child, checkpoints);
  const missing = items.filter((i) => !entryByKey.has(i.key));
  const overdue = missing.filter((i) => dueMinutes(i, child) <= nowMin);
  const mine = exceptions.filter((e) => e.childId === child.id && e.status !== "CLOSED");
  const openEx = mine.filter((e) => e.status === "OPEN").length;
  const followEx = mine.filter((e) => e.status === "FOLLOWUP").length;
  const incomplete = mode === "all" ? missing.length > 0 : overdue.length > 0;
  const color: Color = openEx ? "red" : followEx ? "orange" : incomplete ? "gray" : "green";
  return {
    child,
    color,
    items,
    filled: items.length - missing.length,
    total: items.length,
    overdue,
    missing,
    openEx,
    followEx,
    entryByKey,
  };
}

export function shiftView(
  shift: Shift,
  children: ChildWithUnit[],
  entries: CheckEntry[],
  exceptions: Exception[],
  nowMin: number,
) {
  const cps = shiftCheckpoints(shift.type);
  const statuses = children.map((c) => childStatus(c, entries, exceptions, cps, nowMin, "all"));
  const checked = statuses.filter((s) => s.missing.length === 0).length;
  const needsCare = entries.filter(
    (e) => (e.status === "NEEDS_CARE" || e.status === "NOT_DONE") && children.some((c) => c.id === e.childId),
  ).length;
  return {
    statuses,
    stats: {
      present: children.length,
      checked,
      notChecked: children.length - checked,
      openExceptions: exceptions.filter((e) => e.status === "OPEN").length,
      activeExceptions: exceptions.length,
      needsCare,
      overdue: statuses.reduce((n, s) => n + s.overdue.length, 0),
    },
  };
}

export type CloseIssues = {
  uncheckedChildren: { id: string; name: string }[];
  missingItems: { id: string; name: string; items: string[] }[];
  unaddressed: { id: string; name: string; item: string }[];
  recheckDue: { id: string; name: string; item: string }[];
  openIncidents: { id: string; name: string }[];
  total: number;
};

/** מה חוסם סגירת משמרת. אם total = 0 אפשר לסגור. */
export async function shiftCloseIssues(shift: Shift): Promise<CloseIssues> {
  const { children, entries, exceptions } = await loadDay(shift.date);
  const cps = shiftCheckpoints(shift.type);
  const uncheckedChildren: CloseIssues["uncheckedChildren"] = [];
  const missingItems: CloseIssues["missingItems"] = [];
  for (const c of children) {
    const s = childStatus(c, entries, exceptions, cps, 24 * 60, "all");
    if (s.total > 0 && s.filled === 0) uncheckedChildren.push({ id: c.id, name: c.fullName });
    else if (s.missing.length) missingItems.push({ id: c.id, name: c.fullName, items: s.missing.map((i) => i.label) });
  }
  const now = new Date();
  const addressed = (e: ExceptionFull) =>
    e.shiftId === shift.id || e.updates.some((u) => u.shiftId === shift.id);
  const unaddressed = exceptions
    .filter((e) => e.status === "OPEN" && !addressed(e))
    .map((e) => ({ id: e.id, name: e.child.fullName, item: itemLabel(e.itemKey) }));
  const recheckDue = exceptions
    .filter((e) => e.status === "FOLLOWUP" && e.recheckAt && e.recheckAt <= now && !addressed(e))
    .map((e) => ({ id: e.id, name: e.child.fullName, item: itemLabel(e.itemKey) }));
  const openIncidents = exceptions
    .filter((e) => e.shiftId === shift.id && isIncidentKey(e.itemKey) && e.status === "OPEN")
    .map((e) => ({ id: e.id, name: e.child.fullName }));
  const total =
    uncheckedChildren.length + missingItems.length + unaddressed.length + recheckDue.length + openIncidents.length;
  return { uncheckedChildren, missingItems, unaddressed, recheckDue, openIncidents, total };
}

type Metric = { total: number; ok: number; bad: { id: string; name: string }[] };

function metricFor(
  children: ChildWithUnit[],
  entries: CheckEntry[],
  keys: string[],
  nowMin: number,
  filter?: (c: ChildWithUnit) => boolean,
): Metric {
  const relevant = filter ? children.filter(filter) : children;
  const bad: Metric["bad"] = [];
  for (const c of relevant) {
    const isBad = keys.some((k) => {
      const item = CHECK_ITEMS.find((i) => i.key === k)!;
      if (!itemApplies(item, c)) return false;
      const e = entries.find((x) => x.childId === c.id && x.itemKey === k);
      if (e) return e.status === "NOT_DONE" || e.status === "NEEDS_CARE";
      return dueMinutes(item, c) <= nowMin;
    });
    if (isBad) bad.push({ id: c.id, name: c.fullName });
  }
  return { total: relevant.length, ok: relevant.length - bad.length, bad };
}

/** תמונת מצב יומית למנהל הכפר */
export async function dayMetrics(date: string) {
  const now = nowIL();
  const nowMin = date < now.date ? 24 * 60 + 60 : date > now.date ? -1 : now.minutes;
  const { children, entries, exceptions } = await loadDay(date);
  const statuses = children.map((c) => childStatus(c, entries, exceptions, ALL_CHECKPOINTS, nowMin, "due"));
  const count = (col: Color) => statuses.filter((s) => s.color === col).length;

  const emotionalBad = new Set(
    entries
      .filter((e) => e.itemKey === "emotional" && (e.status === "NEEDS_CARE" || e.status === "NOT_DONE"))
      .map((e) => e.childId),
  );
  exceptions.filter((e) => e.itemKey === "emotional").forEach((e) => emotionalBad.add(e.childId));
  const emotional = children.filter((c) => emotionalBad.has(c.id)).map((c) => ({ id: c.id, name: c.fullName }));

  const [openShifts, lastEntry] = await Promise.all([
    db.shift.findMany({ where: { status: "OPEN" }, include: { manager: true }, orderBy: { startedAt: "desc" } }),
    db.checkEntry.findFirst({ orderBy: { updatedAt: "desc" }, include: { updatedBy: true } }),
  ]);

  const overdueList = statuses
    .filter((s) => s.overdue.length)
    .map((s) => ({ id: s.child.id, name: s.child.fullName, unit: s.child.unit.name, items: s.overdue.map((i) => i.label) }));

  return {
    date,
    nowHHMM: now.hhmm,
    present: children.length,
    green: count("green"),
    orange: count("orange"),
    red: count("red"),
    gray: count("gray"),
    statuses,
    ate: metricFor(children, entries, MEAL_KEYS, nowMin),
    shower: metricFor(children, entries, ["shower"], nowMin),
    activity: metricFor(children, entries, ["activity"], nowMin),
    meds: metricFor(children, entries, MED_KEYS, nowMin, (c) => c.hasMedication),
    awake: metricFor(children, entries, ["bedtime"], nowMin),
    emotional,
    exceptions,
    openExceptions: exceptions.length,
    overdueCount: overdueList.reduce((n, o) => n + o.items.length, 0),
    overdueList,
    openShifts,
    lastEntry,
  };
}
