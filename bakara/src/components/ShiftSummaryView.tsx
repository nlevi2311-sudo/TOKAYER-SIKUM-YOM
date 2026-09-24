import type { ShiftSummary } from "@/lib/summary";
import { fmtDateTime } from "@/lib/time";
import { ExceptionStatusBadge } from "./ui";

export default function ShiftSummaryView({ s }: { s: ShiftSummary }) {
  const total = Object.values(s.entries).reduce((a, b) => a + b, 0);
  const indTotal = Object.values(s.independence).reduce((a, b) => a + b, 0) || 1;
  return (
    <div className="space-y-3">
      <div className="card">
        <div className="text-lg font-bold">
          משמרת {s.type} · {s.manager}
        </div>
        <div className="muted">
          {fmtDateTime(new Date(s.startedAt))} עד {fmtDateTime(new Date(s.endedAt))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Box label="ילדים בפנימייה" value={s.present} />
          <Box label="ילדים שנבדקו" value={s.childrenTouched} />
          <Box label="בדיקות שבוצעו" value={total} />
          <Box label="חריגות שנפתחו" value={s.opened.length} />
          <Box label="בוצע" value={s.entries.DONE ?? 0} />
          <Box label="לא בוצע" value={s.entries.NOT_DONE ?? 0} />
          <Box label="דורש טיפול" value={s.entries.NEEDS_CARE ?? 0} />
          <Box label="חריגות שנסגרו" value={s.closedCount} />
        </div>
        <div className="mt-3 text-sm">
          עצמאות: {Math.round(((s.independence.INDEPENDENT ?? 0) / indTotal) * 100)}% עצמאית ·{" "}
          {Math.round(((s.independence.REMINDER ?? 0) / indTotal) * 100)}% אחרי תזכורת ·{" "}
          {Math.round(((s.independence.ASSISTED ?? 0) / indTotal) * 100)}% אחרי ליווי
        </div>
      </div>
      {s.opened.length ? (
        <div className="card">
          <h3 className="h2 mb-2">חריגות שנפתחו במשמרת</h3>
          <ul className="space-y-1 text-sm">
            {s.opened.map((o, i) => (
              <li key={i} className="flex items-start gap-2">
                <ExceptionStatusBadge status={o.status} />
                <span>
                  <b>{o.child}</b> · {o.item} · {o.what}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="card">
        <h3 className="h2 mb-2">עוברות למשמרת הבאה ({s.stillActive.length})</h3>
        {s.stillActive.length ? (
          <ul className="space-y-1 text-sm">
            {s.stillActive.map((o, i) => (
              <li key={i} className="flex items-start gap-2">
                <ExceptionStatusBadge status={o.status} />
                <span>
                  <b>{o.child}</b> · {o.item} · מטפל: {o.handler}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">אין</p>
        )}
      </div>
      <div className="card space-y-2">
        <div>
          <div className="label">הערות להעברת משמרת</div>
          <p className="whitespace-pre-wrap">{s.handoffNotes || "אין"}</p>
        </div>
        <div>
          <div className="label">משימות להמשך</div>
          <p className="whitespace-pre-wrap">{s.nextTasks || "אין"}</p>
        </div>
      </div>
    </div>
  );
}

function Box({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-50 p-2">
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-slate-600">{label}</div>
    </div>
  );
}
