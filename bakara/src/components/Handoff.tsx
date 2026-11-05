import Link from "next/link";
import { itemLabel, shiftLabel } from "@/lib/checks";
import type { ExceptionFull } from "@/lib/engine";
import { fmtDateTime } from "@/lib/time";
import { lastClosedShift } from "@/lib/shift";
import { ExceptionStatusBadge } from "./ui";

/** מה המנהל התורן הנכנס צריך לראות מיד */
export default async function Handoff({
  exceptions,
  overdue,
}: {
  exceptions: ExceptionFull[];
  overdue: { id: string; name: string; items: string[] }[];
}) {
  const prev = await lastClosedShift();
  const followChildren = new Map<string, { id: string; name: string; items: string[] }>();
  for (const e of exceptions) {
    const cur = followChildren.get(e.childId) ?? { id: e.childId, name: e.child.fullName, items: [] };
    cur.items.push(itemLabel(e.itemKey));
    followChildren.set(e.childId, cur);
  }
  return (
    <div className="space-y-3">
      {prev ? (
        <div className="card space-y-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="h2">משמרת קודמת: {shiftLabel(prev.type)}</h3>
            <span className="muted">
              {prev.manager.fullName} · נסגרה {fmtDateTime(prev.endedAt)}
            </span>
          </div>
          <div>
            <div className="label">הערות המנהל היוצא</div>
            <p className="whitespace-pre-wrap">{prev.handoffNotes || "לא נכתבו הערות"}</p>
          </div>
          <div>
            <div className="label">משימות להמשך</div>
            <p className="whitespace-pre-wrap font-semibold text-warn">{prev.nextTasks || "אין"}</p>
          </div>
          {prev.exceptions.length ? (
            <div>
              <div className="label">אירועים וחריגות מהמשמרת</div>
              <ul className="space-y-1 text-sm">
                {prev.exceptions.map((e) => (
                  <li key={e.id} className="flex items-center gap-2">
                    <ExceptionStatusBadge status={e.status} />
                    <Link href={`/exceptions/${e.id}`} className="underline">
                      {e.child.fullName}: {itemLabel(e.itemKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="card">
        <h3 className="h2 mb-2">ילדים שדורשים מעקב ({followChildren.size})</h3>
        {followChildren.size ? (
          <ul className="divide-y divide-slate-100">
            {[...followChildren.values()].map((c) => (
              <li key={c.id} className="py-2">
                <Link href={`/children/${c.id}`} className="font-semibold underline">
                  {c.name}
                </Link>
                <span className="muted"> · {c.items.join(", ")}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">אין</p>
        )}
        <Link href="/exceptions" className="mt-2 inline-block text-sm font-semibold text-brand underline">
          לכל החריגות הפתוחות ({exceptions.length})
        </Link>
      </div>

      {overdue.length ? (
        <div className="card">
          <h3 className="h2 mb-2 text-bad">דברים שלא הושלמו היום ({overdue.reduce((n, o) => n + o.items.length, 0)})</h3>
          <ul className="space-y-1 text-sm">
            {overdue.slice(0, 12).map((o) => (
              <li key={o.id}>
                <span className="font-semibold">{o.name}:</span> {o.items.join(", ")}
              </li>
            ))}
            {overdue.length > 12 ? <li className="muted">ועוד {overdue.length - 12} ילדים</li> : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function recheckSoon(exceptions: ExceptionFull[]) {
  const now = Date.now();
  return exceptions.filter((e) => e.status !== "CLOSED" && e.recheckAt && e.recheckAt.getTime() <= now);
}
