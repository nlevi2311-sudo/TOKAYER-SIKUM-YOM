import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import ShiftSummaryView from "@/components/ShiftSummaryView";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { shiftLabel } from "@/lib/checks";
import type { ShiftSummary } from "@/lib/summary";
import { fmtDateTime } from "@/lib/time";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";

export default async function ShiftSummaryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ closed?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const { closed } = await searchParams;
  const shift = await db.shift.findUnique({ where: { id }, include: { manager: true } });
  if (!shift) notFound();
  const summary: ShiftSummary | null = shift.summaryJson ? JSON.parse(shift.summaryJson) : null;
  return (
    <AppShell user={user} title={`סיכום משמרת ${shiftLabel(shift.type)}`} back="/shifts">
      <div className="mx-auto max-w-3xl space-y-3">
        {closed ? <div className="rounded-2xl bg-ok-bg p-4 font-bold text-ok">המשמרת נסגרה והסיכום נשמר.</div> : null}
        <div className="no-print flex justify-end">
          <PrintButton />
        </div>
        {summary ? (
          <ShiftSummaryView s={summary} />
        ) : (
          <div className="card">
            המשמרת עדיין פתוחה. {shift.manager.fullName} · נפתחה {fmtDateTime(shift.startedAt)}
          </div>
        )}
      </div>
    </AppShell>
  );
}
