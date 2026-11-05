import Link from "next/link";
import { ageText } from "@/lib/checks";
import AppShell from "@/components/AppShell";
import { requireUser, can } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ChildrenPage({ searchParams }: { searchParams: Promise<{ all?: string }> }) {
  const user = await requireUser();
  const { all } = await searchParams;
  const children = await db.child.findMany({
    where: all ? {} : { active: true },
    include: { unit: true, _count: { select: { exceptions: { where: { status: { not: "CLOSED" } } } } } },
    orderBy: [{ unit: { sortOrder: "asc" } }, { fullName: "asc" }],
  });
  const units = [...new Map(children.map((c) => [c.unitId, c.unit])).values()];
  return (
    <AppShell user={user} title="ילדים">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {can.manageChildren(user) ? (
            <Link href="/children/new" className="btn-primary">
              + הוספת ילד
            </Link>
          ) : null}
          {can.manageChildren(user) ? (
            <Link href="/admin/import" className="btn-secondary">
              ייבוא מאקסל
            </Link>
          ) : null}
          <Link href={all ? "/children" : "/children?all=1"} className="btn-secondary">
            {all ? "רק פעילים" : "כולל לא פעילים"}
          </Link>
        </div>
        <p className="muted">
          {children.filter((c) => c.present && c.active).length} בפנימייה מתוך {children.filter((c) => c.active).length} פעילים
        </p>
        {units.map((u) => (
          <section key={u.id} className="card">
            <h2 className="h2 mb-2">{u.name}</h2>
            <ul className="divide-y divide-slate-100">
              {children
                .filter((c) => c.unitId === u.id)
                .map((c) => (
                  <li key={c.id} className="flex items-center gap-2 py-2">
                    <Link href={`/children/${c.id}`} className="min-w-0 flex-1">
                      <div className={`font-bold ${c.active ? "" : "text-slate-400 line-through"}`}>{c.fullName}</div>
                      <div className="text-sm text-slate-600">
                        {[ageText(c.age), `שינה ${c.bedtime}`].filter(Boolean).join(" · ")}
                        {c.hasMedication ? " · 💊" : ""}
                        {c._count.exceptions ? <span className="font-bold text-bad"> · {c._count.exceptions} חריגות פעילות</span> : null}
                      </div>
                    </Link>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${c.present ? "bg-ok-bg text-ok" : "bg-idle-bg text-idle"}`}>
                      {c.present ? "בפנימייה" : "לא בפנימייה"}
                    </span>
                    {can.manageChildren(user) ? (
                      <Link href={`/children/${c.id}/edit`} className="btn-secondary min-h-10 px-3 text-sm">
                        עריכה
                      </Link>
                    ) : null}
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
