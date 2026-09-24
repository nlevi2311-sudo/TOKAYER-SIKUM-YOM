import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import { ColorDot, COLOR_STYLES } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { CHECKPOINTS, dueLabel, dueMinutes, itemApplies, CHECK_ITEMS, shiftCheckpoints, itemLabel } from "@/lib/checks";
import { childStatus, loadDay } from "@/lib/engine";
import { getMyOpenShift } from "@/lib/shift";
import { fmtTime, nowIL } from "@/lib/time";
import ChildChecks, { type ItemView } from "./ChildChecks";
import PresenceToggle from "./PresenceToggle";

export const dynamic = "force-dynamic";

export default async function ChildCheckPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(["DUTY", "ADMIN"]);
  const { id } = await params;
  const shift = await getMyOpenShift(user.id);
  if (!shift) redirect("/shift");
  const now = nowIL();
  const nowMin = shift.date < now.date ? 24 * 60 : now.minutes;
  const { children, entries, exceptions } = await loadDay(shift.date);
  const idx = children.findIndex((c) => c.id === id);
  if (idx === -1) {
    const { db } = await import("@/lib/db");
    const c = await db.child.findUnique({ where: { id } });
    if (!c) notFound();
    return (
      <AppShell user={user} title={c.fullName} back="/shift">
        <div className="card space-y-3">
          <p>הילד מסומן כלא נמצא בפנימייה.</p>
          <PresenceToggle childId={c.id} present={false} />
        </div>
      </AppShell>
    );
  }
  const child = children[idx];
  const cps = shiftCheckpoints(shift.type);
  const status = childStatus(child, entries, exceptions, cps, nowMin, "all");
  const prev = children[(idx - 1 + children.length) % children.length];
  const next = children[(idx + 1) % children.length];
  const childEx = exceptions.filter((e) => e.childId === child.id);

  const items: ItemView[] = CHECK_ITEMS.filter((i) => itemApplies(i, child)).map((i) => {
    const e = entries.find((x) => x.childId === child.id && x.itemKey === i.key);
    const ex = childEx.find((x) => x.itemKey === i.key && x.date === shift.date);
    return {
      key: i.key,
      label: i.label,
      checkpoint: i.checkpoint,
      due: dueLabel(i, child),
      hint: i.hint,
      independence: i.independence,
      overdue: !e && dueMinutes(i, child) <= nowMin,
      inShift: cps.includes(i.checkpoint),
      entry: e
        ? { status: e.status, independence: e.independence, by: e.updatedBy.fullName, at: fmtTime(e.updatedAt) }
        : null,
      exception: ex ? { id: ex.id, status: ex.status } : null,
    };
  });

  return (
    <AppShell user={user} title={child.fullName} back="/shift">
      <div className="space-y-3 pb-20">
        <div className={`card flex flex-wrap items-center gap-3 ${COLOR_STYLES[status.color].bg}`}>
          <ColorDot color={status.color} size="h-6 w-6" />
          <div className="min-w-0 flex-1">
            <div className="text-xl font-bold">{child.fullName}</div>
            <div className="text-sm text-slate-600">
              {child.unit.name} · גיל {child.age} · שינה {child.bedtime}
              {child.hasMedication ? " · 💊 טיפול תרופתי" : ""}
            </div>
          </div>
          <div className="text-left text-sm font-bold">
            {status.filled}/{status.total}
            <div className={COLOR_STYLES[status.color].text}>{COLOR_STYLES[status.color].label}</div>
          </div>
        </div>
        {child.importantNotes || child.medicationNotes ? (
          <div className="rounded-2xl bg-yellow-50 p-3 text-sm ring-1 ring-yellow-200">
            {child.importantNotes ? <div>📌 {child.importantNotes}</div> : null}
            {child.medicationNotes ? <div>💊 {child.medicationNotes}</div> : null}
          </div>
        ) : null}
        {childEx.length ? (
          <div className="card space-y-1">
            <div className="font-bold">חריגות פעילות</div>
            {childEx.map((e) => (
              <Link key={e.id} href={`/exceptions/${e.id}`} className={`block rounded-lg px-2 py-1 text-sm font-semibold underline ${e.status === "OPEN" ? "text-bad" : "text-warn"}`}>
                {itemLabel(e.itemKey)}: {e.whatHappened}
              </Link>
            ))}
          </div>
        ) : null}

        <ChildChecks
          childId={child.id}
          items={items}
          checkpoints={CHECKPOINTS.map((c) => ({ ...c, inShift: cps.includes(c.key) }))}
        />

        <div className="flex flex-wrap gap-2">
          <Link href={`/exceptions/new?child=${child.id}`} className="btn-secondary text-bad">
            + אירוע חריג
          </Link>
          <Link href={`/children/${child.id}`} className="btn-secondary">
            היסטוריה
          </Link>
          <PresenceToggle childId={child.id} present />
        </div>
      </div>

      <div className="no-print fixed inset-x-0 bottom-[60px] z-20 border-t border-slate-200 bg-white/95 px-4 py-2 backdrop-blur md:bottom-0">
        <div className="mx-auto flex max-w-6xl items-center gap-2">
          <Link href={`/shift/child/${prev.id}`} className="btn-secondary flex-1 truncate">
            → {prev.fullName}
          </Link>
          <Link href="/shift" className="btn-secondary px-3" aria-label="לרשימה">
            ☰
          </Link>
          <Link href={`/shift/child/${next.id}`} className="btn-primary flex-1 truncate">
            {next.fullName} ←
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
