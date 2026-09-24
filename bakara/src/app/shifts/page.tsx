import Link from "next/link";
import AppShell from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { shiftLabel } from "@/lib/checks";
import { fmtDate, fmtTime, weekday } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function ShiftsPage() {
  const user = await requireUser();
  const shifts = await db.shift.findMany({
    orderBy: { startedAt: "desc" },
    take: 60,
    include: { manager: true, _count: { select: { exceptions: true, checkEntries: true } } },
  });
  return (
    <AppShell user={user} title="משמרות">
      <ul className="space-y-2">
        {shifts.map((s) => (
          <li key={s.id}>
            <Link href={`/shifts/${s.id}`} className="card flex items-center gap-3">
              <span className={`h-3 w-3 rounded-full ${s.status === "OPEN" ? "bg-orange-500" : "bg-ok"}`} />
              <div className="flex-1">
                <div className="font-bold">
                  {shiftLabel(s.type)} · יום {weekday(s.date)} {fmtDate(s.date)}
                </div>
                <div className="muted">
                  {s.manager.fullName} · {fmtTime(s.startedAt)}
                  {s.endedAt ? `–${fmtTime(s.endedAt)}` : " · פתוחה"}
                </div>
              </div>
              <div className="text-left text-sm text-slate-600">
                {s._count.checkEntries} בדיקות
                <br />
                {s._count.exceptions} חריגות
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
