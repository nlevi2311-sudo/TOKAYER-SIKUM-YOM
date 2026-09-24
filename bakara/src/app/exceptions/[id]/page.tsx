import Link from "next/link";
import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import { ExceptionStatusBadge } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { itemLabel } from "@/lib/checks";
import { exceptionInclude } from "@/lib/engine";
import { fmtDateTime, fmtDate } from "@/lib/time";
import ExceptionActions from "./ExceptionActions";

export const dynamic = "force-dynamic";

export default async function ExceptionPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const e = await db.exception.findUnique({ where: { id }, include: { ...exceptionInclude, shift: { include: { manager: true } } } });
  if (!e) notFound();
  const fields: [string, string][] = [
    ["מה קרה", e.whatHappened],
    ["מה הסיבה", e.reason],
    ["מה נעשה", e.actionsTaken],
    ["מי מטפל", e.handler],
    ["צריך מעקב", e.needsFollowup ? "כן" : "לא"],
    ["בדיקה חוזרת", e.recheckAt ? fmtDateTime(e.recheckAt) : "לא נקבעה"],
    ["מנהל הכפר צריך לדעת", e.notifyDirector ? "כן" : "לא"],
    ["עדכון גורם נוסף", e.notifyOther || "לא"],
  ];
  return (
    <AppShell user={user} title="חריגה" back="/exceptions">
      <div className="mx-auto max-w-2xl space-y-3">
        <div className="card space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <ExceptionStatusBadge status={e.status} />
            <Link href={`/children/${e.childId}`} className="text-xl font-bold underline">
              {e.child.fullName}
            </Link>
            <span className="text-slate-600">· {e.child.unit.name}</span>
          </div>
          <div className="text-lg font-semibold">{itemLabel(e.itemKey)}</div>
          <div className="muted">
            נפתחה {fmtDateTime(e.openedAt)} ע״י {e.openedBy.fullName} · יום {fmtDate(e.date)}
          </div>
          <dl className="grid gap-2 pt-2 sm:grid-cols-2">
            {fields.map(([k, v]) => (
              <div key={k} className="rounded-xl bg-slate-50 p-2">
                <dt className="text-xs font-semibold text-slate-500">{k}</dt>
                <dd className="whitespace-pre-wrap">{v}</dd>
              </div>
            ))}
          </dl>
          {e.status === "CLOSED" ? (
            <div className="rounded-xl bg-ok-bg p-3">
              <div className="font-bold text-ok">
                נסגרה {fmtDateTime(e.closedAt)} ע״י {e.closedBy?.fullName}
              </div>
              <div className="whitespace-pre-wrap">{e.closureNote}</div>
            </div>
          ) : null}
        </div>

        {e.status !== "CLOSED" ? <ExceptionActions id={e.id} handler={e.handler} /> : null}

        <div className="card">
          <h2 className="h2 mb-2">התייחסויות ({e.updates.length})</h2>
          {e.updates.length ? (
            <ol className="space-y-2">
              {e.updates.map((u) => (
                <li key={u.id} className="rounded-xl bg-slate-50 p-2">
                  <div className="text-xs text-slate-500">
                    {fmtDateTime(u.createdAt)} · {u.user.fullName}
                  </div>
                  <div className="whitespace-pre-wrap">{u.text}</div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="muted">עדיין אין התייחסות מעבר לפתיחה</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
