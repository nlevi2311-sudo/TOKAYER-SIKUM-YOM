import Link from "next/link";
import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import { Empty, ExceptionStatusBadge } from "@/components/ui";
import { can, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { CHECK_ITEMS, itemApplies, itemLabel, ageText } from "@/lib/checks";
import { independencePct, itemStats, weeklyTrend } from "@/lib/stats";
import { addDays, daysBetween, fmtDate, fmtDateTime, nowIL } from "@/lib/time";

export const dynamic = "force-dynamic";

const CELL: Record<string, string> = {
  DONE: "bg-green-500 text-white",
  NOT_DONE: "bg-red-600 text-white",
  NEEDS_CARE: "bg-orange-500 text-white",
  NA: "bg-slate-300 text-slate-700",
};
const IND_SHORT: Record<string, string> = { INDEPENDENT: "ע", REMINDER: "ת", ASSISTED: "ל" };

export default async function ChildHistoryPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ days?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const sp = await searchParams;
  const days = [14, 30, 90].includes(Number(sp.days)) ? Number(sp.days) : 30;
  const child = await db.child.findUnique({ where: { id }, include: { unit: true } });
  if (!child) notFound();
  const today = nowIL().date;
  const from = addDays(today, -(days - 1));
  const [entries, exceptions] = await Promise.all([
    db.checkEntry.findMany({ where: { childId: id, date: { gte: from } }, orderBy: { date: "asc" } }),
    db.exception.findMany({ where: { childId: id }, include: { openedBy: true }, orderBy: { openedAt: "desc" }, take: 50 }),
  ]);
  const stats = itemStats(entries);
  const trend = weeklyTrend(entries);
  const last7 = independencePct(entries.filter((e) => e.date > addDays(today, -7)));
  const before = independencePct(entries.filter((e) => e.date <= addDays(today, -7)));
  const grid = daysBetween(addDays(today, -13), today).reverse();
  const items = CHECK_ITEMS.filter((i) => itemApplies(i, child));
  const reminders = entries.filter((e) => e.independence === "REMINDER" || e.independence === "ASSISTED").length;

  return (
    <AppShell user={user} title={child.fullName} back="/children">
      <div className="space-y-4">
        <div className="card flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="text-xl font-bold">{child.fullName}</div>
            <div className="text-sm text-slate-600">
              {[child.unit.name, ageText(child.age), `שינה ${child.bedtime}`, child.present ? "בפנימייה" : "לא בפנימייה"].filter(Boolean).join(" · ")}
              {child.hasMedication ? " · 💊 טיפול תרופתי" : ""}
            </div>
            {child.importantNotes ? <div className="mt-1 text-sm">📌 {child.importantNotes}</div> : null}
            {child.extraInfo ? <div className="text-sm text-slate-600">{child.extraInfo}</div> : null}
          </div>
          <div className="flex gap-2">
            {[14, 30, 90].map((d) => (
              <Link key={d} href={`/children/${id}?days=${d}`} className={`btn min-h-10 text-sm ${d === days ? "bg-slate-800 text-white" : "btn-secondary"}`}>
                {d} יום
              </Link>
            ))}
            {can.manageChildren(user) ? (
              <Link href={`/children/${id}/edit`} className="btn-secondary min-h-10 text-sm">
                עריכה
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Tile label="עצמאות ב-7 ימים אחרונים" value={last7 === null ? "—" : `${last7}%`} />
          <Tile
            label="לעומת התקופה שלפני"
            value={last7 === null || before === null ? "—" : `${last7 - before > 0 ? "+" : ""}${last7 - before}%`}
            tone={last7 !== null && before !== null ? (last7 >= before ? "ok" : "bad") : undefined}
          />
          <Tile label="פעמים שהיה צריך להזכיר או ללוות" value={reminders} />
          <Tile label="חריגות בתקופה" value={exceptions.filter((e) => e.date >= from).length} />
        </div>

        <div className="card">
          <h2 className="h2 mb-2">מדד עצמאות לפי שבוע</h2>
          {trend.length ? (
            <div className="space-y-2">
              {trend.map((w) => (
                <div key={w.week} className="flex items-center gap-2 text-sm">
                  <span className="w-20 shrink-0 text-slate-600">{fmtDate(w.week)}</span>
                  <div className="h-6 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-green-600" style={{ width: `${w.independent ?? 0}%` }} />
                  </div>
                  <span className="w-12 shrink-0 text-left font-bold tabular-nums">{w.independent ?? "—"}%</span>
                  <span className="hidden w-32 shrink-0 text-xs text-slate-500 sm:inline">
                    {w.reminders} תזכורות · {w.notDone} לא בוצע
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <Empty>אין עדיין נתונים</Empty>
          )}
        </div>

        <div className="card">
          <h2 className="h2 mb-2">לפי תחום ({days} יום)</h2>
          <div className="overflow-x-auto">
            <table className="table min-w-[560px]">
              <thead>
                <tr>
                  <th>תחום</th>
                  <th>בוצע</th>
                  <th>עצמאית</th>
                  <th>תזכורת</th>
                  <th>ליווי</th>
                  <th>לא בוצע</th>
                  <th>דורש טיפול</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s) => (
                  <tr key={s.key}>
                    <td className="font-semibold">{s.label}</td>
                    <td>{s.done}</td>
                    <td>{s.independent || ""}</td>
                    <td>{s.reminder || ""}</td>
                    <td>{s.assisted || ""}</td>
                    <td className={s.notDone ? "font-bold text-bad" : ""}>{s.notDone || ""}</td>
                    <td className={s.needsCare ? "font-bold text-warn" : ""}>{s.needsCare || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2 className="h2 mb-1">14 ימים אחרונים</h2>
          <p className="muted mb-2">ע = עצמאית · ת = אחרי תזכורת · ל = אחרי ליווי · ירוק בוצע · אדום לא בוצע · כתום דורש טיפול · ריק = לא נבדק</p>
          <div className="overflow-x-auto">
            <table className="border-separate border-spacing-0.5 text-xs">
              <thead>
                <tr>
                  <th className="sticky right-0 bg-white px-1 text-right">תחום</th>
                  {grid.map((d) => (
                    <th key={d} className="px-0.5 font-semibold whitespace-nowrap text-slate-600">
                      {d.slice(8, 10)}/{d.slice(5, 7)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.key}>
                    <td className="sticky right-0 bg-white px-1 font-semibold whitespace-nowrap">{i.label}</td>
                    {grid.map((d) => {
                      const e = entries.find((x) => x.date === d && x.itemKey === i.key);
                      return (
                        <td key={d} className={`h-7 min-w-9 rounded text-center font-bold ${e ? CELL[e.status] : "bg-slate-50 text-slate-300"}`}>
                          {e?.independence ? IND_SHORT[e.independence] ?? "" : ""}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2 className="h2 mb-2">חריגות ואירועים</h2>
          {exceptions.length ? (
            <ul className="divide-y divide-slate-100">
              {exceptions.map((e) => (
                <li key={e.id} className="py-2">
                  <Link href={`/exceptions/${e.id}`} className="block">
                    <div className="flex flex-wrap items-center gap-2">
                      <ExceptionStatusBadge status={e.status} />
                      <b>{itemLabel(e.itemKey)}</b>
                      <span className="text-xs text-slate-500">
                        {fmtDateTime(e.openedAt)} · {e.openedBy.fullName}
                      </span>
                    </div>
                    <div className="text-sm">{e.whatHappened}</div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>אין חריגות</Empty>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Tile({ label, value, tone }: { label: string; value: string | number; tone?: "ok" | "bad" }) {
  return (
    <div className={`rounded-2xl p-3 ring-1 ring-slate-200 ${tone === "ok" ? "bg-ok-bg text-ok" : tone === "bad" ? "bg-bad-bg text-bad" : "bg-white"}`}>
      <div className="text-2xl font-extrabold tabular-nums">{value}</div>
      <div className="text-xs font-semibold text-slate-600">{label}</div>
    </div>
  );
}
