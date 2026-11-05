import Link from "next/link";
import AppShell from "@/components/AppShell";
import { ColorDot, COLOR_STYLES, ExceptionStatusBadge, StatTile } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { itemLabel, shiftLabel } from "@/lib/checks";
import { dayMetrics } from "@/lib/engine";
import { fmtDate, fmtDateTime, fmtTime, nowIL, weekday } from "@/lib/time";

export const dynamic = "force-dynamic";

function names(list: { id: string; name: string }[]) {
  if (!list.length) return null;
  const shown = list.slice(0, 3).map((c) => c.name).join(", ");
  return list.length > 3 ? `${shown} ועוד ${list.length - 3}` : shown;
}

export default async function DashboardPage() {
  const user = await requireUser(["DIRECTOR", "ADMIN"]);
  const now = nowIL();
  const m = await dayMetrics(now.date);
  const now_ = Date.now();
  const director = m.exceptions.filter((e) => e.notifyDirector);
  const recheckDue = m.exceptions.filter((e) => e.recheckAt && e.recheckAt.getTime() <= now_);
  const openOnly = m.exceptions.filter((e) => e.status === "OPEN");

  return (
    <AppShell user={user} title="מצב הכפר היום">
      <div className="space-y-4">
        <div className="card flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-xl font-bold">
              יום {weekday(now.date)} {fmtDate(now.date)} · {now.hhmm}
            </div>
            <div className="text-sm text-slate-600">
              מנהל תורן נוכחי:{" "}
              {m.openShifts.length ? (
                m.openShifts.map((s) => `${s.manager.fullName} (${shiftLabel(s.type)}, מ-${fmtTime(s.startedAt)})`).join(" · ")
              ) : (
                <b className="text-bad">אין משמרת פתוחה</b>
              )}
            </div>
            <div className="text-sm text-slate-600">
              עדכון אחרון: {m.lastEntry ? `${fmtDateTime(m.lastEntry.updatedAt)} · ${m.lastEntry.updatedBy.fullName}` : "אין"}
            </div>
          </div>
          <div className="flex gap-3 text-sm font-semibold">
            {(["green", "orange", "red", "gray"] as const).map((c) => (
              <span key={c} className="flex items-center gap-1">
                <ColorDot color={c} size="h-3 w-3" />
                {m[c]} {COLOR_STYLES[c].label}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          <StatTile value={m.present} label="ילדים בפנימייה" sub={`${m.green} תקינים · ${m.orange + m.red} דורשים מעקב`} />
          <StatTile value={m.ate.ok} label="אכלו כנדרש" tone={m.ate.bad.length ? "warn" : "ok"} sub={m.ate.bad.length ? `לא אכלו / חסר: ${names(m.ate.bad)}` : "הכל תקין עד עכשיו"} />
          <StatTile value={m.shower.ok} label="רחצה תקינה" tone={m.shower.bad.length ? "warn" : "ok"} sub={m.shower.bad.length ? `לא התקלחו: ${names(m.shower.bad)}` : "אין חוסרים"} />
          <StatTile value={m.activity.ok} label="השתתפו בפעילות" tone={m.activity.bad.length ? "warn" : "ok"} sub={m.activity.bad.length ? `לא השתתפו: ${names(m.activity.bad)}` : "אין חוסרים"} />
          <StatTile value={`${m.meds.ok}/${m.meds.total}`} label="טיפול תרופתי בזמן" tone={m.meds.bad.length ? "bad" : "ok"} sub={m.meds.bad.length ? `לא קיבלו: ${names(m.meds.bad)}` : "כל מי שצריך קיבל"} />
          <StatTile value={m.awake.bad.length} label="ערים אחרי שעת השינה" tone={m.awake.bad.length ? "bad" : "ok"} sub={names(m.awake.bad) ?? "אין"} />
          <StatTile value={m.emotional.length} label="דורשים מעקב רגשי" tone={m.emotional.length ? "warn" : "ok"} sub={names(m.emotional) ?? "אין"} />
          <StatTile value={m.openExceptions} label="חריגות פעילות" tone={openOnly.length ? "bad" : m.openExceptions ? "warn" : "ok"} sub={`${openOnly.length} פתוחות · ${m.openExceptions - openOnly.length} במעקב`} href="/exceptions" />
          <StatTile value={m.overdueCount} label="בדיקות שעדיין לא בוצעו" tone={m.overdueCount ? "bad" : "ok"} sub={m.overdueCount ? `אצל ${m.overdueList.length} ילדים` : "הכל בזמן"} />
        </div>

        <h2 className="h1 pt-2">דורש את תשומת הלב שלך</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          <AttentionCard title="סומנו לידיעת מנהל הכפר" empty="אין">
            {director.map((e) => (
              <ExRow key={e.id} e={e} />
            ))}
          </AttentionCard>
          <AttentionCard title="חריגות פתוחות בלי תוכנית מעקב" empty="אין">
            {openOnly.map((e) => (
              <ExRow key={e.id} e={e} />
            ))}
          </AttentionCard>
          <AttentionCard title="עבר זמן הבדיקה החוזרת" empty="אין">
            {recheckDue.map((e) => (
              <ExRow key={e.id} e={e} />
            ))}
          </AttentionCard>
          <AttentionCard title="לא בוצע בזמן היום" empty="הכל בוצע בזמן">
            {m.overdueList.map((o) => (
              <li key={o.id} className="py-2 text-sm">
                <Link href={`/children/${o.id}`} className="font-bold underline">
                  {o.name}
                </Link>{" "}
                <span className="text-slate-500">({o.unit})</span>: {o.items.join(", ")}
              </li>
            ))}
          </AttentionCard>
        </div>

        <div className="card">
          <h2 className="h2 mb-2">כל הילדים</h2>
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
            {m.statuses.map((s) => (
              <Link key={s.child.id} href={`/children/${s.child.id}`} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${COLOR_STYLES[s.color].bg}`}>
                <ColorDot color={s.color} size="h-3 w-3" />
                <span className="font-semibold">{s.child.fullName}</span>
                <span className="text-xs text-slate-500">{s.child.unit.name}</span>
                {s.overdue.length ? <span className="mr-auto text-xs font-bold text-bad">חסר {s.overdue.length}</span> : null}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function AttentionCard({ title, empty, children }: { title: string; empty: string; children: React.ReactNode[] }) {
  return (
    <div className="card">
      <h3 className="h2 mb-1">
        {title} <span className="text-slate-400">({children.length})</span>
      </h3>
      {children.length ? <ul className="divide-y divide-slate-100">{children}</ul> : <p className="muted">{empty}</p>}
    </div>
  );
}

function ExRow({ e }: { e: Awaited<ReturnType<typeof dayMetrics>>["exceptions"][number] }) {
  return (
    <li className="py-2">
      <Link href={`/exceptions/${e.id}`} className="block">
        <div className="flex flex-wrap items-center gap-2">
          <ExceptionStatusBadge status={e.status} />
          <b>{e.child.fullName}</b>
          <span className="text-sm text-slate-600">· {itemLabel(e.itemKey)}</span>
        </div>
        <div className="text-sm">{e.whatHappened}</div>
        <div className="text-xs text-slate-500">
          {fmtDateTime(e.openedAt)} · מטפל: {e.handler}
          {e.recheckAt ? ` · בדיקה חוזרת ${fmtDateTime(e.recheckAt)}` : ""}
        </div>
      </Link>
    </li>
  );
}
