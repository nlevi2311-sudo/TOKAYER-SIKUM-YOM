// נתוני דמה בלבד. אין כאן שמות או מידע אמיתי.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CHECK_ITEMS, Checkpoint, itemApplies, dueMinutes, CheckItem } from "./checks";
import { addDays, nowIL, parseLocalDateTime, fromMinutes } from "./time";
import { buildShiftSummary } from "./summary";

// מחולל אקראי קבוע כדי שהנתונים יהיו זהים בכל הרצה
let seed = 20260924;
function rnd() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}
const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];

const UNITS = ["ביתן אלון", "ביתן ברוש", "ביתן גפן", "ביתן דקל"];
const FIRST = [
  "נועם", "איתי", "יובל", "עומר", "אלה", "תמר", "רוני", "עידו", "שחר", "מאיה", "ליאור", "דניאל",
  "נויה", "אביב", "גל", "הילה", "עדי", "יהלי", "ליה", "אורי", "טל", "שקד", "רז", "אגם",
];
const LAST = ["א.", "ב.", "ג.", "ד.", "ה.", "ו.", "ז.", "ח.", "ט.", "י.", "כ.", "ל."];
const NOTES = [
  "נתוני דמה. מתקשה במעברים בין פעילויות.",
  "נתוני דמה. זקוק לתזכורות בבוקר.",
  "נתוני דמה. רגישות לרעש בשעות הערב.",
  "נתוני דמה. מגיב טוב לשיחה אישית קצרה.",
  "",
  "",
];

const SHIFT_HOURS: Record<Checkpoint, { start: string; end: string }> = {
  MORNING: { start: "06:30", end: "12:00" },
  NOON: { start: "12:00", end: "17:00" },
  EVENING: { start: "17:00", end: "22:00" },
  NIGHT: { start: "22:00", end: "23:55" },
};

const WHAT: Record<string, string[]> = {
  default: ["לא הגיע בזמן", "סירב לבצע", "היה מחוץ לביתן בזמן הזה"],
  emotional: ["נראה מוצף ומסתגר אחרי שיחת טלפון", "בכי ממושך בערב"],
  incident: ["ויכוח חריף עם חבר לביתן, הופרדו", "יצא מהביתן בלי אישור, חזר אחרי 20 דקות"],
};

/** מוחק את כל הנתונים וטוען נתוני דמה חדשים סביב התאריך של היום */
export async function seedDemo(db: PrismaClient, log: (msg: string) => void = console.log) {
  seed = 20260924;
  log("מנקה נתונים קיימים...");
  await db.auditLog.deleteMany();
  await db.exceptionUpdate.deleteMany();
  await db.exception.deleteMany();
  await db.checkEntry.deleteMany();
  await db.shift.deleteMany();
  await db.session.deleteMany();
  await db.child.deleteMany();
  await db.unit.deleteMany();
  await db.user.deleteMany();

  const hash = await bcrypt.hash("demo1234", 10);
  const mkUser = (username: string, fullName: string, role: string) =>
    db.user.create({ data: { username, fullName, role, passwordHash: hash } });
  const admin = await mkUser("admin", "מנהל מערכת (דמה)", "ADMIN");
  const director = await mkUser("director", "מנהל הכפר (דמה)", "DIRECTOR");
  const duty1 = await mkUser("duty1", "דנה ש. (תורנית דמה)", "DUTY");
  const duty2 = await mkUser("duty2", "אורי מ. (תורן דמה)", "DUTY");
  const duty3 = await mkUser("duty3", "מיכל ר. (תורנית דמה)", "DUTY");
  const duties = [duty1, duty2, duty3];

  const units = [];
  for (let i = 0; i < UNITS.length; i++) units.push(await db.unit.create({ data: { name: UNITS[i], sortOrder: i } }));

  const children = [];
  for (let i = 0; i < 24; i++) {
    const age = 8 + Math.floor(rnd() * 10);
    const bedtime = age < 12 ? "21:00" : age < 15 ? "21:30" : "22:00";
    const hasMedication = rnd() < 0.4;
    children.push(
      await db.child.create({
        data: {
          fullName: `${FIRST[i]} ${LAST[i % LAST.length]}`,
          unitId: units[i % 4].id,
          age,
          bedtime,
          hasMedication,
          medicationNotes: hasMedication ? "תרופת דמה, בוקר וערב" : "",
          familyContact: rnd() < 0.85,
          present: !(i === 7 || i === 18),
          importantNotes: pick(NOTES),
          extraInfo: i === 7 || i === 18 ? "ביקור בית (דמה)" : "",
        },
      }),
    );
  }
  // פרופיל עצמאות לכל ילד: רמה התחלתית ומגמה
  const profile = new Map(children.map((c) => [c.id, { base: 0.3 + rnd() * 0.4, trend: (rnd() - 0.3) * 0.03 }]));
  const present = children.filter((c) => c.present);

  const now = nowIL();
  const today = now.date;
  const currentCp: Checkpoint =
    now.minutes < 12 * 60 ? "MORNING" : now.minutes < 17 * 60 ? "NOON" : now.minutes < 22 * 60 ? "EVENING" : "NIGHT";
  const order: Checkpoint[] = ["MORNING", "NOON", "EVENING", "NIGHT"];

  async function runShift(opts: {
    date: string;
    cp: Checkpoint;
    managerId: string;
    dayIndex: number;
    close: boolean;
    fillRatio: number;
    exceptionRate: number;
  }) {
    const { date, cp, managerId, dayIndex } = opts;
    const hours = SHIFT_HOURS[cp];
    const startedAt = parseLocalDateTime(`${date}T${hours.start}`)!;
    const shift = await db.shift.create({
      data: { managerId, date, type: cp, startedAt, status: "OPEN" },
    });
    const items = CHECK_ITEMS.filter((i) => i.checkpoint === cp);
    const rows = [];
    for (const c of present) {
      if (rnd() > opts.fillRatio) continue;
      const p = profile.get(c.id)!;
      const level = Math.min(0.95, Math.max(0.05, p.base + p.trend * dayIndex));
      for (const item of items) {
        if (!itemApplies(item, c)) continue;
        if (!opts.close && dueMinutes(item, c) > now.minutes + 60) continue;
        const at = parseLocalDateTime(`${date}T${fromMinutes(Math.min(dueMinutes(item, c) - 10, 23 * 60 + 50))}`)!;
        let status = "DONE";
        const r = rnd();
        if (item.key === "family" && r < 0.15) status = "NA";
        else if (r < opts.exceptionRate) status = rnd() < 0.5 ? "NOT_DONE" : "NEEDS_CARE";
        let independence: string | null = null;
        if (item.independence) {
          if (status === "NOT_DONE") independence = "NONE";
          else if (status === "DONE") {
            const q = rnd();
            independence = q < level ? "INDEPENDENT" : q < level + (1 - level) * 0.65 ? "REMINDER" : "ASSISTED";
          }
        }
        rows.push({ data: { date, childId: c.id, itemKey: item.key, status, independence, shiftId: shift.id, updatedById: managerId, createdAt: at, updatedAt: at }, status, item, child: c });
      }
    }
    await db.checkEntry.createMany({ data: rows.map((r) => r.data) });
    for (const r of rows) {
      const { item, child } = r;
      if (r.status === "NOT_DONE" || r.status === "NEEDS_CARE") {
        await createException({ date, item, childId: child.id, shiftId: shift.id, openedById: managerId, at: r.data.createdAt, closeIt: opts.close && (dayIndex < 12 || rnd() < 0.7) });
      }
    }
    if (opts.close) {
      const endedAt = parseLocalDateTime(`${date}T${hours.end}`)!;
      await db.shift.update({
        where: { id: shift.id },
        data: {
          handoffNotes: pick(["משמרת שקטה יחסית.", "ערב עמוס, ביתן ברוש דרש נוכחות צמודה.", "שני ילדים ביקשו שיחה עם העו״ס מחר.", ""]),
          nextTasks: pick(["לוודא שיחה עם ההורים של נועם א.", "בדיקה חוזרת של מצב רגשי בביתן גפן", ""]),
        },
      });
      const summary = await buildShiftSummary(db, shift.id, endedAt);
      await db.shift.update({ where: { id: shift.id }, data: { status: "CLOSED", endedAt, summaryJson: JSON.stringify(summary) } });
    }
    return shift;
  }

  async function createException(o: { date: string; item: CheckItem; childId: string; shiftId: string; openedById: string; at: Date; closeIt: boolean; status?: string; notifyDirector?: boolean }) {
    const list = WHAT[o.item.key] ?? WHAT.default;
    const followup = !o.closeIt && (o.status === "FOLLOWUP" || (!o.status && rnd() < 0.6));
    const ex = await db.exception.create({
      data: {
        childId: o.childId,
        date: o.date,
        itemKey: o.item.key,
        shiftId: o.shiftId,
        openedById: o.openedById,
        openedAt: o.at,
        whatHappened: pick(list),
        reason: pick(["עייפות", "קושי רגשי", "סירוב", "לא ידוע עדיין"]),
        actionsTaken: pick(["שיחה עם המדריך בביתן", "שיחה אישית עם הילד", "המדריך ליווה אותו לביצוע"]),
        handler: pick(["מדריך הביתן", "עו״ס הביתן", "מנהל תורן"]),
        needsFollowup: followup,
        recheckAt: followup ? new Date(o.at.getTime() + 3 * 3600_000) : null,
        notifyDirector: o.notifyDirector ?? rnd() < 0.3,
        status: o.closeIt ? "CLOSED" : o.status ?? (followup ? "FOLLOWUP" : "OPEN"),
        closedById: o.closeIt ? pick(duties).id : null,
        closedAt: o.closeIt ? new Date(o.at.getTime() + 2 * 3600_000) : null,
        closureNote: o.closeIt ? pick(["בוצע בליווי, הילד רגוע", "טופל בשיחה, אין צורך במעקב", "הושלם באיחור"]) : "",
      },
    });
    await db.auditLog.create({
      data: { userId: o.openedById, action: "EXCEPTION_OPEN", entity: "Exception", entityId: ex.id, createdAt: o.at, details: "{}" },
    });
    return ex;
  }

  log("יוצר היסטוריה של 14 ימים...");
  for (let d = 14; d >= 1; d--) {
    const date = addDays(today, -d);
    for (let k = 0; k < order.length; k++) {
      await runShift({ date, cp: order[k], managerId: duties[(d + k) % 3].id, dayIndex: 14 - d, close: true, fillRatio: 1, exceptionRate: 0.012 });
    }
  }

  log("יוצר את היום הנוכחי...");
  const curIdx = order.indexOf(currentCp);
  for (let k = 0; k < curIdx; k++) {
    await runShift({ date: today, cp: order[k], managerId: duties[k % 3].id, dayIndex: 14, close: true, fillRatio: 1, exceptionRate: 0.01 });
  }
  // המשמרת הפעילה: duty2, חלק מהילדים עוד לא נבדקו
  const openShift = await runShift({ date: today, cp: currentCp, managerId: duty2.id, dayIndex: 14, close: false, fillRatio: 0.6, exceptionRate: 0 });

  // חריגות פתוחות לדוגמה במשמרת הפעילה
  const at = new Date();
  const incidentItem = CHECK_ITEMS.find((i) => i.key === "incident")!;
  const emotionalItem = CHECK_ITEMS.find((i) => i.key === "emotional")!;
  const mealItem = CHECK_ITEMS.find((i) => i.key === (currentCp === "MORNING" ? "breakfast" : currentCp === "NOON" ? "lunch" : "dinner"))!;
  await createException({ date: today, item: incidentItem, childId: present[2].id, shiftId: openShift.id, openedById: duty2.id, at, closeIt: false, status: "OPEN", notifyDirector: true });
  await createException({ date: today, item: emotionalItem, childId: present[5].id, shiftId: openShift.id, openedById: duty2.id, at, closeIt: false, status: "FOLLOWUP", notifyDirector: true });
  await createException({ date: today, item: mealItem, childId: present[11].id, shiftId: openShift.id, openedById: duty2.id, at, closeIt: false, status: "OPEN" });

  await db.auditLog.create({ data: { userId: admin.id, action: "SEED", entity: "System", details: JSON.stringify({ director: director.username }) } });

  const counts = await Promise.all([db.child.count(), db.shift.count(), db.checkEntry.count(), db.exception.count({ where: { status: { not: "CLOSED" } } })]);
  log(`נוצרו ${counts[0]} ילדים, ${counts[1]} משמרות, ${counts[2]} בדיקות, ${counts[3]} חריגות פעילות.`);
  log("משתמשים: admin / director / duty1 / duty2 / duty3, סיסמה: demo1234");
}

