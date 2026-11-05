import Link from "next/link";
import AppShell from "@/components/AppShell";
import PrintButton from "@/components/PrintButton";
import { Empty, ExceptionStatusBadge } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { CHECK_ITEMS, itemLabel, MANUAL_INCIDENT, shiftLabel } from "@/lib/checks";
import { completion, independencePct, itemStats } from "@/lib/stats";
import { addDays, fmtDate, fmtDateTime, fmtTime, nowIL, weekday } from "@/lib/time";
import { weekStart } from "@/lib/stats";

export const dynamic = "force-dynamic";

const TYPES = [
  { key: "shift", label: "סיכום משמרת" },
  { key: "day", label: "סיכום יומי" },
  { key: "week", label: "סיכום שבועי" },
  { key: "month", label: "סיכום חודשי" },
  { key: "child", label: "לפי ילד" },
  { key: "unit", label: "לפי ביתן" },
  { key: "category", label: "לפי סוג חריגה" },
];

type SP = { type?: string; date?: string; month?: string; unitId?: string; childId?: string; key?: string };

function rangeFor(sp: SP, today: string): { from: string; to: string; title: string } {
  const date = sp.date || today;
  if (sp.type === "day") return { from: date, to: date, title: `יום ${weekday(date)} ${fmtDate(date)}` };
  if (sp.type === "month") {
    const m = sp.month || today.slice(0, 7);
    const last = addDays(`${addDays(`${m}-28`, 4).slice(0, 7)}-01`, -1);
    return { from: `${m}-01`, to: last, title: `חודש ${m.slice(5)}/${m.slice(0, 4)}` };
  }
  if (sp.type === "week") {
    const s = weekStart(date);
    return { from: s, to: addDays(s, 6), title: `שבוע ${fmtDate(s)} עד ${fmtDate(addDays(s, 6))}` };
  }
  return { from: addDays(date, -29), to: date, title: `30 ימים עד ${fmtDate(date)}` };
}

export default async function ReportsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireUser(["DIRECTOR", "ADMIN"]);
  const sp = await searchParams;
  const today = nowIL().date;
  const [units, children, shifts] = await Promise.all([
    db.unit.findMany({ orderBy: { sortOrder: "asc" } }),
    db.child.findMany({ where: { active: true }, orderBy: { fullName: "asc" }, include: { unit: true } }),
    sp.type === "shift"
      ? db.shift.findMany({ where: { status: "CLOSED" }, orderBy: { endedAt: "desc" }, take: 40, include: { manager: true } })
      : Promise.resolve([]),
  ]);

  return (
    <AppShell user={user} title="דוחות">
      <div className="space-y-4">
        <div className="no-print -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {TYPES.map((t) => (
            <Link key={t.key} href={`/reports?type=${t.key}`} className={`btn min-h-10 shrink-0 text-sm ${sp.type === t.key ? "bg-slate-800 text-white" : "btn-secondary"}`}>
              {t.label}
            </Link>
          ))}
        </div>

        {!sp.type ? <Empty>בחר סוג דוח</Empty> : null}

        {sp.type === "shift" ? (
          <div className="card">
            <h2 className="h2 mb-2">משמרות שנסגרו</h2>
            <ul className="divide-y divide-slate-100">
              {shifts.map((s) => (
                <li key={s.id}>
                  <Link href={`/shifts/${s.id}`} className="flex justify-between py-2">
                    <span className="font-semibold">
                      {shiftLabel(s.type)} · {weekday(s.date)} {fmtDate(s.date)}
                    </span>
                    <span className="muted">
                      {s.manager.fullName} · {fmtTime(s.startedAt)}–{fmtTime(s.endedAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {sp.type && sp.type !== "shift" ? (
          <form className="no-print card grid gap-3 sm:grid-cols-4 sm:items-end">
            <input type="hidden" name="type" value={sp.type} />
            {sp.type === "month" ? (
              <div>
                <label className="label">חודש</label>
                <input type="month" name="month" className="input" defaultValue={sp.month || today.slice(0, 7)} />
              </div>
            ) : (
              <div>
                <label className="label">{sp.type === "day" ? "תאריך" : sp.type === "week" ? "תאריך בתוך השבוע" : "עד תאריך (30 יום אחורה)"}</label>
                <input type="date" name="date" className="input" defaultValue={sp.date || today} />
              </div>
            )}
            {sp.type === "unit" ? (
              <div>
                <label className="label">ביתן</label>
                <select name="unitId" className="input" defaultValue={sp.unitId}>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            {sp.type === "child" ? (
              <div>
                <label className="label">ילד</label>
                <select name="childId" className="input" defaultValue={sp.childId}>
                  {children.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} · {c.unit.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            {sp.type === "category" ? (
              <div>
                <label className="label">סוג חריגה</label>
                <select name="key" className="input" defaultValue={sp.key}>
                  <option value="">כל הסוגים</option>
                  <option value={MANUAL_INCIDENT}>אירוע חריג (ידני)</option>
                  {CHECK_ITEMS.map((i) => (
                    <option key={i.key} value={i.key}>
                      {i.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <button className="btn-primary">הפקת דוח</button>
          </form>
        ) : null}

        {sp.type && !["shift", "category"].includes(sp.type) && (sp.type !== "child" || sp.childId) ? <RangeReport sp={sp} today={today} /> : null}
        {sp.type === "category" ? <CategoryReport sp={sp} today={today} /> : null}
      </div>
    </AppShell>
  );
}

async function RangeReport({ sp, today }: { sp: SP; today: string }) {
  const { from, to, title } = rangeFor(sp, today);
  const childWhere = sp.type === "unit" && sp.unitId ? { unitId: sp.unitId } : sp.type === "child" && sp.childId ? { id: sp.childId } : {};
  const [children, entries, exceptions, shifts, unitName] = await Promise.all([
    db.child.findMany({ where: { active: true, ...childWhere }, include: { unit: true }, orderBy: [{ unit: { sortOrder: "asc" } }, { fullName: "asc" }] }),
    db.checkEntry.findMany({ where: { date: { gte: from, lte: to }, child: childWhere } }),
    db.exception.findMany({ where: { date: { gte: from, lte: to }, child: childWhere }, include: { child: true }, orderBy: { openedAt: "desc" } }),
    db.shift.count({ where: { date: { gte: from, lte: to } } }),
    sp.unitId ? db.unit.findUnique({ where: { id: sp.unitId } }).then((u) => u?.name) : Promise.resolve(undefined),
  ]);
  const stats = itemStats(entries);
  const problems = [...stats].sort((a, b) => b.notDone + b.needsCare - (a.notDone + a.needsCare)).filter((s) => s.notDone + s.needsCare > 0).slice(0, 6);
  const perChild = children
    .map((c) => {
      const es = entries.filter((e) => e.childId === c.id);
      return {
        c,
        completion: completion(es),
        ind: independencePct(es),
        bad: es.filter((e) => e.status === "NOT_DONE" || e.status === "NEEDS_CARE").length,
        reminders: es.filter((e) => e.independence === "REMINDER" || e.independence === "ASSISTED").length,
        ex: exceptions.filter((e) => e.childId === c.id).length,
      };
    })
    .sort((a, b) => b.bad + b.ex - (a.bad + a.ex));
  const unitRows = [...new Map(children.map((c) => [c.unitId, c.unit])).values()].map((u) => {
    const ids = new Set(children.filter((c) => c.unitId === u.id).map((c) => c.id));
    const es = entries.filter((e) => ids.has(e.childId));
    return {
      u,
      count: ids.size,
      completion: completion(es),
      ind: independencePct(es),
      bad: es.filter((e) => e.status === "NOT_DONE" || e.status === "NEEDS_CARE").length,
      ex: exceptions.filter((e) => ids.has(e.childId)).length,
    };
  });
  const byCat = new Map<string, number>();
  exceptions.forEach((e) => byCat.set(e.itemKey, (byCat.get(e.itemKey) ?? 0) + 1));
  const heading =
    sp.type === "unit" ? `${unitName ?? ""} · ${title}` : sp.type === "child" ? `${children[0]?.fullName ?? ""} · ${title}` : title;
  const stillActive = exceptions.filter((e) => e.status !== "CLOSED");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="h1">{heading}</h2>
        <div className="flex gap-2">
          {sp.type === "child" && sp.childId ? (
            <Link href={`/children/${sp.childId}?days=90`} className="btn-secondary no-print">
              היסטוריה מלאה
            </Link>
          ) : null}
          <PrintButton />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Box label="משמרות" value={shifts} />
        <Box label="בדיקות" value={entries.length} />
        <Box label="השלמה" value={completion(entries) === null ? "—" : `${completion(entries)}%`} />
        <Box label="עצמאות" value={independencePct(entries) === null ? "—" : `${independencePct(entries)}%`} />
        <Box label="חריגות (פעילות)" value={`${exceptions.length} (${stillActive.length})`} />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="card">
          <h3 className="h2 mb-2">תחומים עם הכי הרבה חוסרים</h3>
          {problems.length ? (
            <table className="table">
              <thead>
                <tr>
                  <th>תחום</th>
                  <th>לא בוצע</th>
                  <th>דורש טיפול</th>
                  <th>תזכורת/ליווי</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((s) => (
                  <tr key={s.key}>
                    <td className="font-semibold">{s.label}</td>
                    <td className="text-bad">{s.notDone}</td>
                    <td className="text-warn">{s.needsCare}</td>
                    <td>{s.reminder + s.assisted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="muted">אין חוסרים בתקופה</p>
          )}
        </div>
        <div className="card">
          <h3 className="h2 mb-2">חריגות לפי סוג</h3>
          {byCat.size ? (
            <ul className="space-y-1">
              {[...byCat.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([k, n]) => (
                  <li key={k} className="flex justify-between">
                    <span>{itemLabel(k)}</span>
                    <b>{n}</b>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="muted">אין חריגות בתקופה</p>
          )}
        </div>
      </div>

      {sp.type !== "child" && sp.type !== "unit" ? (
        <div className="card overflow-x-auto">
          <h3 className="h2 mb-2">לפי ביתן</h3>
          <table className="table">
            <thead>
              <tr>
                <th>ביתן</th>
                <th>ילדים</th>
                <th>השלמה</th>
                <th>עצמאות</th>
                <th>לא בוצע / דורש טיפול</th>
                <th>חריגות</th>
              </tr>
            </thead>
            <tbody>
              {unitRows.map((r) => (
                <tr key={r.u.id}>
                  <td className="font-semibold">{r.u.name}</td>
                  <td>{r.count}</td>
                  <td>{r.completion ?? "—"}%</td>
                  <td>{r.ind ?? "—"}%</td>
                  <td>{r.bad}</td>
                  <td>{r.ex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {sp.type !== "child" ? (
        <div className="card overflow-x-auto">
          <h3 className="h2 mb-2">ילדים (מהדורש תשומת לב ועד התקין)</h3>
          <table className="table">
            <thead>
              <tr>
                <th>ילד</th>
                <th>ביתן</th>
                <th>השלמה</th>
                <th>עצמאות</th>
                <th>תזכורות</th>
                <th>לא בוצע</th>
                <th>חריגות</th>
              </tr>
            </thead>
            <tbody>
              {perChild.map((r) => (
                <tr key={r.c.id}>
                  <td>
                    <Link href={`/children/${r.c.id}`} className="font-semibold underline">
                      {r.c.fullName}
                    </Link>
                  </td>
                  <td>{r.c.unit.name}</td>
                  <td>{r.completion ?? "—"}%</td>
                  <td>{r.ind ?? "—"}%</td>
                  <td>{r.reminders}</td>
                  <td className={r.bad ? "font-bold text-bad" : ""}>{r.bad}</td>
                  <td className={r.ex ? "font-bold text-bad" : ""}>{r.ex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <h3 className="h2 mb-2">לפי תחום</h3>
          <table className="table">
            <thead>
              <tr>
                <th>תחום</th>
                <th>בוצע</th>
                <th>עצמאית</th>
                <th>תזכורת</th>
                <th>ליווי</th>
                <th>לא בוצע</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr key={s.key}>
                  <td className="font-semibold">{s.label}</td>
                  <td>{s.done}</td>
                  <td>{s.independent}</td>
                  <td>{s.reminder}</td>
                  <td>{s.assisted}</td>
                  <td>{s.notDone + s.needsCare}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {stillActive.length ? (
        <div className="card">
          <h3 className="h2 mb-2">חריגות מהתקופה שעדיין פעילות</h3>
          <ul className="space-y-1 text-sm">
            {stillActive.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center gap-2">
                <ExceptionStatusBadge status={e.status} />
                <Link href={`/exceptions/${e.id}`} className="underline">
                  {e.child.fullName} · {itemLabel(e.itemKey)} · {fmtDate(e.date)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

async function CategoryReport({ sp, today }: { sp: SP; today: string }) {
  const { from, to, title } = rangeFor({ ...sp, type: "range" }, today);
  const list = await db.exception.findMany({
    where: { date: { gte: from, lte: to }, ...(sp.key ? { itemKey: sp.key } : {}) },
    include: { child: { include: { unit: true } }, openedBy: true },
    orderBy: { openedAt: "desc" },
  });
  const byChild = new Map<string, { name: string; n: number }>();
  list.forEach((e) => byChild.set(e.childId, { name: e.child.fullName, n: (byChild.get(e.childId)?.n ?? 0) + 1 }));
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="h1">
          {sp.key ? itemLabel(sp.key) : "כל סוגי החריגות"} · {title}
        </h2>
        <PrintButton />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Box label="סה״כ" value={list.length} />
        <Box label="נסגרו" value={list.filter((e) => e.status === "CLOSED").length} />
        <Box label="עדיין פעילות" value={list.filter((e) => e.status !== "CLOSED").length} />
      </div>
      <div className="card">
        <h3 className="h2 mb-2">חוזר אצל</h3>
        <div className="flex flex-wrap gap-2 text-sm">
          {[...byChild.values()]
            .sort((a, b) => b.n - a.n)
            .map((c) => (
              <span key={c.name} className="rounded-full bg-slate-100 px-3 py-1">
                {c.name} · <b>{c.n}</b>
              </span>
            ))}
        </div>
      </div>
      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>מתי</th>
              <th>ילד</th>
              <th>סוג</th>
              <th>מה קרה</th>
              <th>סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {list.map((e) => (
              <tr key={e.id}>
                <td className="whitespace-nowrap">{fmtDateTime(e.openedAt)}</td>
                <td>
                  <Link href={`/exceptions/${e.id}`} className="underline">
                    {e.child.fullName}
                  </Link>
                </td>
                <td>{itemLabel(e.itemKey)}</td>
                <td>{e.whatHappened}</td>
                <td>
                  <ExceptionStatusBadge status={e.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Box({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
      <div className="text-2xl font-extrabold tabular-nums">{value}</div>
      <div className="text-xs font-semibold text-slate-600">{label}</div>
    </div>
  );
}
