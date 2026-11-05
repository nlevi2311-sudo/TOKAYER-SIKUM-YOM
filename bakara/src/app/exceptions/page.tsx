import Link from "next/link";
import AppShell from "@/components/AppShell";
import { Empty, ExceptionStatusBadge } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { CHECK_ITEMS, itemLabel, MANUAL_INCIDENT } from "@/lib/checks";
import { exceptionInclude } from "@/lib/engine";
import { fmtDateTime } from "@/lib/time";
import type { Prisma } from "@prisma/client";
import AutoSubmitSelect from "@/components/AutoSubmitSelect";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "active", label: "פעילות" },
  { key: "OPEN", label: "פתוחות" },
  { key: "FOLLOWUP", label: "במעקב" },
  { key: "CLOSED", label: "סגורות" },
];

export default async function ExceptionsPage({ searchParams }: { searchParams: Promise<{ tab?: string; type?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const tab = sp.tab ?? "active";
  const where: Prisma.ExceptionWhereInput = {};
  if (tab === "active") where.status = { not: "CLOSED" };
  else where.status = tab;
  if (sp.type) where.itemKey = sp.type;
  const list = await db.exception.findMany({
    where,
    include: exceptionInclude,
    orderBy: tab === "CLOSED" ? { closedAt: "desc" } : { openedAt: "desc" },
    take: 100,
  });
  // קודם פתוחות, אחר כך מה שהגיע זמן הבדיקה החוזרת שלו
  const now = Date.now();
  if (tab !== "CLOSED")
    list.sort((a, b) => {
      const r = (e: typeof a) => (e.status === "OPEN" ? 0 : e.recheckAt && e.recheckAt.getTime() <= now ? 1 : 2);
      return r(a) - r(b);
    });
  const types = [{ key: MANUAL_INCIDENT, label: "אירוע חריג (ידני)" }, ...CHECK_ITEMS.map((i) => ({ key: i.key, label: i.label }))];

  return (
    <AppShell user={user} title="חריגים">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`/exceptions?tab=${t.key}${sp.type ? `&type=${sp.type}` : ""}`}
              className={`btn min-h-10 text-sm ${tab === t.key ? "bg-slate-800 text-white" : "btn-secondary"}`}
            >
              {t.label}
            </Link>
          ))}
          <form className="flex-1">
            <input type="hidden" name="tab" value={tab} />
            <AutoSubmitSelect name="type" defaultValue={sp.type ?? ""} options={[{ value: "", label: "כל הסוגים" }, ...types.map((t) => ({ value: t.key, label: t.label }))]} />
          </form>
        </div>
        {user.role !== "DIRECTOR" ? (
          <Link href="/exceptions/new" className="btn-danger w-full">
            + פתיחת אירוע חריג
          </Link>
        ) : null}
        {list.length === 0 ? <Empty>אין חריגות להצגה</Empty> : null}
        <ul className="space-y-2">
          {list.map((e) => {
            const recheckDue = e.status !== "CLOSED" && e.recheckAt && e.recheckAt.getTime() <= now;
            return (
              <li key={e.id}>
                <Link href={`/exceptions/${e.id}`} className={`card block space-y-1 ${e.status === "OPEN" ? "ring-2 ring-bad" : ""}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <ExceptionStatusBadge status={e.status} />
                    <span className="text-lg font-bold">{e.child.fullName}</span>
                    <span className="font-semibold text-slate-600">· {itemLabel(e.itemKey)}</span>
                    {e.notifyDirector ? <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-800">למנהל הכפר</span> : null}
                    {recheckDue ? <span className="rounded-full bg-bad px-2 py-0.5 text-xs font-bold text-white">הגיע זמן בדיקה חוזרת</span> : null}
                  </div>
                  <div className="text-sm">{e.whatHappened}</div>
                  <div className="grid gap-x-4 text-xs text-slate-600 sm:grid-cols-2">
                    <span>
                      נפתחה {fmtDateTime(e.openedAt)} ע״י {e.openedBy.fullName}
                    </span>
                    <span>מטפל: {e.handler}</span>
                    <span>מה נעשה: {e.updates[0]?.text ?? e.actionsTaken}</span>
                    {e.recheckAt && e.status !== "CLOSED" ? <span>בדיקה חוזרת: {fmtDateTime(e.recheckAt)}</span> : null}
                    {e.status === "CLOSED" ? <span>נסגרה {fmtDateTime(e.closedAt)} ע״י {e.closedBy?.fullName}</span> : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </AppShell>
  );
}

