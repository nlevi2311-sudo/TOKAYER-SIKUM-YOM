import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, pad2 } from "@/components/staff/lomda/content-blocks";
import { UnitQuiz } from "@/components/staff/lomda/unit-quiz";
import { requireStaff } from "@/lib/auth/session";
import { findUnit, getAllUnits, getProcedure, toPublicUnit } from "@/lib/content/lomda";
import { questionId } from "@/lib/content/lomda-types";
import { getLomdaState } from "@/lib/data/lomda";

export async function generateMetadata({ params }: PageProps<"/staff/lomda/[unit]">): Promise<Metadata> {
  const { unit } = await params;
  return { title: findUnit(unit)?.title ?? "לומדת קליטה" };
}

export default async function LomdaUnitPage({ params }: PageProps<"/staff/lomda/[unit]">) {
  const { unit: unitId } = await params;
  const user = await requireStaff(`/staff/lomda/${unitId}`);
  const state = await getLomdaState(user);
  const list = getAllUnits(state.track, state.bitan);
  const index = list.findIndex((u) => u.id === unitId);
  if (index === -1) notFound();
  const unit = list[index];
  const pub = toPublicUnit(unit);
  const isLast = index === list.length - 1;

  const prev = index === 0 ? { href: "/staff/lomda", label: "לתוכן העניינים" } : { href: `/staff/lomda/${list[index - 1].id}`, label: "ליחידה הקודמת" };
  const next = isLast
    ? state.track
      ? { href: "/staff/lomda/finish", label: "לסיום ולאישור" }
      : { href: "/staff/lomda", label: "לבחירת תפקיד" }
    : { href: `/staff/lomda/${list[index + 1].id}`, label: "ליחידה הבאה" };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        eyebrow={`יחידה ${index + 1} מתוך ${list.length}`}
        title={unit.title}
        description={unit.subtitle}
        breadcrumbs={[
          { label: "בית", href: "/staff" },
          { label: "לומדת קליטה", href: "/staff/lomda" },
          { label: unit.title },
        ]}
      />

      {pub.sections.map((s, i) => (
        <section key={`${i}-${s.heading}`} className="space-y-3 rounded-2xl border bg-card p-4 sm:p-5">
          <h2 className="text-lg font-bold text-primary">{s.heading}</h2>
          {s.points.length ? (
            <ul className="list-disc space-y-1.5 ps-5">
              {s.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          ) : null}
          {s.table ? <DataTable table={s.table} /> : null}
        </section>
      ))}

      <p className="rounded-xl border-s-4 border-primary bg-surface px-4 py-3 font-bold">{unit.rule}</p>

      {unit.refs.length ? (
        <section className="space-y-2 rounded-2xl border bg-card p-4 sm:p-5">
          <h2 className="font-bold">בהרחבה באוגדן</h2>
          <div className="flex flex-col gap-1.5">
            {unit.refs.map((n) => {
              const p = getProcedure(n);
              return p ? (
                <Link key={n} href={`/staff/ogdan/${n}`} className="rounded-lg border px-3 py-2 text-sm hover:border-primary">
                  <b className="tabular-nums text-primary">{pad2(n)}</b> {p.t}
                </Link>
              ) : null;
            })}
          </div>
        </section>
      ) : null}

      <UnitQuiz
        key={unit.id}
        unitId={unit.id}
        questions={pub.quiz}
        answered={unit.quiz.map((q, i) => (state.right[questionId(unit.id, i)] ? { option: q.answer, why: q.why } : null))}
        prev={prev}
        next={next}
      />
    </div>
  );
}
