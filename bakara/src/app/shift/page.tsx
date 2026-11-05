import Link from "next/link";
import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import Handoff from "@/components/Handoff";
import { ColorDot, COLOR_STYLES, StatTile } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { SHIFT_TYPES, shiftLabel } from "@/lib/checks";
import { dayMetrics, loadDay, shiftView, Color } from "@/lib/engine";
import { getMyOpenShift } from "@/lib/shift";
import { fmtTime, nowIL } from "@/lib/time";
import { openShiftAction } from "@/app/actions/shift";

export const dynamic = "force-dynamic";

function suggestedType(minutes: number) {
  if (minutes < 12 * 60) return "MORNING";
  if (minutes < 17 * 60) return "NOON";
  if (minutes < 22 * 60) return "EVENING";
  return "NIGHT";
}

const COLOR_RANK: Record<Color, number> = { red: 0, orange: 2, gray: 3, green: 4 };

export default async function ShiftPage({ searchParams }: { searchParams: Promise<{ unit?: string; color?: string }> }) {
  const user = await requireUser();
  if (user.role === "DIRECTOR") redirect("/dashboard");
  const sp = await searchParams;
  const shift = await getMyOpenShift(user.id);
  const now = nowIL();

  if (!shift) {
    const metrics = await dayMetrics(now.date);
    const suggested = suggestedType(now.minutes);
    return (
      <AppShell user={user} title="פתיחת משמרת">
        <div className="grid gap-4 md:grid-cols-2">
          <form action={openShiftAction} className="card space-y-4">
            <h2 className="h1">פתיחת משמרת</h2>
            <p className="muted">
              {user.fullName} · {now.hhmm}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {SHIFT_TYPES.map((t) => (
                <label key={t.key} className="cursor-pointer">
                  <input type="radio" name="type" value={t.key} defaultChecked={t.key === suggested} className="peer sr-only" />
                  <span className="btn-secondary w-full peer-checked:bg-brand peer-checked:text-white peer-checked:ring-brand">
                    {t.label}
                  </span>
                </label>
              ))}
            </div>
            <button className="btn-primary w-full text-lg">פתיחת משמרת</button>
            <p className="muted">לפני הפתיחה, עבור על העברת המשמרת.</p>
          </form>
          <div>
            <h2 className="h2 mb-2">העברת משמרת</h2>
            <Handoff exceptions={metrics.exceptions} overdue={metrics.overdueList} />
          </div>
        </div>
      </AppShell>
    );
  }

  const { children, entries, exceptions } = await loadDay(shift.date);
  const view = shiftView(shift, children, entries, exceptions, shift.date < now.date ? 24 * 60 : now.minutes);
  const units = [...new Map(children.map((c) => [c.unit.id, c.unit])).values()];
  let list = view.statuses;
  if (sp.unit) list = list.filter((s) => s.child.unitId === sp.unit);
  if (sp.color) list = list.filter((s) => s.color === sp.color);
  // קודם מה שדחוף: חריגה פתוחה, אחר כך באיחור, מעקב, לא הושלם, תקין
  const rank = (s: (typeof list)[number]) => (s.color === "red" ? 0 : s.overdue.length ? 1 : COLOR_RANK[s.color]);
  list = [...list].sort((a, b) => rank(a) - rank(b) || b.overdue.length - a.overdue.length);
  const q = (p: Record<string, string | undefined>) => {
    const u = new URLSearchParams();
    const merged = { unit: sp.unit, color: sp.color, ...p };
    Object.entries(merged).forEach(([k, v]) => v && u.set(k, v));
    const s = u.toString();
    return s ? `/shift?${s}` : "/shift";
  };
  const metrics = await dayMetrics(shift.date);

  return (
    <AppShell user={user} title={`משמרת ${shiftLabel(shift.type)}`}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="muted">
            נפתחה ב-{fmtTime(shift.startedAt)} · עכשיו {now.hhmm}
          </p>
          <Link href="/exceptions/new" className="btn-danger min-h-10 text-sm">
            + אירוע חריג
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <StatTile value={view.stats.present} label="ילדים בפנימייה" />
          <StatTile value={view.stats.checked} label="נבדקו במלואם" tone="ok" />
          <StatTile value={view.stats.notChecked} label="עוד לא נבדקו" tone={view.stats.notChecked ? "warn" : "ok"} href={q({ color: "gray" })} />
          <StatTile value={view.stats.overdue} label="בדיקות באיחור" tone={view.stats.overdue ? "bad" : "ok"} />
          <StatTile value={view.stats.openExceptions} label="חריגות פתוחות" tone={view.stats.openExceptions ? "bad" : "ok"} href="/exceptions" />
          <StatTile value={view.stats.needsCare} label="דורשים טיפול" tone={view.stats.needsCare ? "warn" : "ok"} />
        </div>

        <details className="card">
          <summary className="cursor-pointer font-bold">העברת משמרת: מה השאירו לך</summary>
          <div className="mt-3">
            <Handoff exceptions={metrics.exceptions} overdue={metrics.overdueList} />
          </div>
        </details>

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <Link href={q({ unit: undefined, color: undefined })} className={`btn min-h-10 shrink-0 text-sm ${!sp.unit && !sp.color ? "bg-slate-800 text-white" : "btn-secondary"}`}>
            הכל
          </Link>
          {units.map((u) => (
            <Link key={u.id} href={q({ unit: sp.unit === u.id ? undefined : u.id })} className={`btn min-h-10 shrink-0 text-sm ${sp.unit === u.id ? "bg-slate-800 text-white" : "btn-secondary"}`}>
              {u.name}
            </Link>
          ))}
          {(["red", "orange", "gray", "green"] as Color[]).map((c) => (
            <Link key={c} href={q({ color: sp.color === c ? undefined : c })} className={`btn min-h-10 shrink-0 text-sm ${sp.color === c ? "bg-slate-800 text-white" : "btn-secondary"}`}>
              <ColorDot color={c} size="h-3 w-3" />
              {COLOR_STYLES[c].label}
            </Link>
          ))}
        </div>

        <ul className="grid gap-2 md:grid-cols-2">
          {list.map((s) => (
            <li key={s.child.id}>
              <Link
                href={`/shift/child/${s.child.id}`}
                className={`flex items-center gap-3 rounded-2xl p-3 ring-1 ring-slate-200 active:scale-[0.99] ${COLOR_STYLES[s.color].bg}`}
              >
                <ColorDot color={s.color} size="h-6 w-6" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-lg font-bold">{s.child.fullName}</div>
                  <div className="text-sm text-slate-600">
                    {s.child.unit.name} · {s.filled}/{s.total} {s.child.hasMedication ? "· 💊" : ""}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {s.overdue.length ? (
                    <span className="rounded-full bg-bad px-2 py-0.5 text-xs font-bold text-white">חסר {s.overdue.length}</span>
                  ) : null}
                  {s.openEx ? <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-bad">חריגה פתוחה</span> : null}
                  {s.followEx ? <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-warn">במעקב</span> : null}
                </div>
                <span className="text-2xl text-slate-400">‹</span>
              </Link>
            </li>
          ))}
        </ul>

        <Link href="/shift/close" className="btn-primary w-full text-lg">
          סיום משמרת
        </Link>
      </div>
    </AppShell>
  );
}
