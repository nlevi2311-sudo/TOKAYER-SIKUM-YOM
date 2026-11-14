import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ProcedureBody, pad2 } from "@/components/staff/lomda/content-blocks";
import { OGDAN_GATES, getProcedure } from "@/lib/content/lomda";

function parse(n: string): number {
  return /^\d{1,2}$/.test(n) ? Number(n) : NaN;
}

export async function generateMetadata({ params }: PageProps<"/staff/ogdan/[n]">): Promise<Metadata> {
  const { n } = await params;
  const p = getProcedure(parse(n));
  return { title: p ? `נוהל ${pad2(p.n)}: ${p.t}` : "נוהל" };
}

export default async function ProcedurePage({ params }: PageProps<"/staff/ogdan/[n]">) {
  const { n } = await params;
  const p = getProcedure(parse(n));
  if (!p) notFound();
  const gate = OGDAN_GATES.find((g) => g.n === p.g);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        eyebrow={gate ? `שער ${pad2(gate.n)} · ${gate.t}` : undefined}
        title={`${pad2(p.n)}. ${p.t}`}
        breadcrumbs={[
          { label: "בית", href: "/staff" },
          { label: "האוגדן", href: "/staff/ogdan" },
          { label: `נוהל ${pad2(p.n)}` },
        ]}
      />
      <article className="rounded-2xl border bg-card p-5">
        <ProcedureBody procedure={p} />
      </article>
      <div className="flex flex-wrap justify-between gap-3 text-sm font-semibold">
        {getProcedure(p.n - 1) ? (
          <Link href={`/staff/ogdan/${p.n - 1}`} className="text-primary hover:underline">
            לנוהל הקודם
          </Link>
        ) : (
          <span />
        )}
        {getProcedure(p.n + 1) ? (
          <Link href={`/staff/ogdan/${p.n + 1}`} className="text-primary hover:underline">
            לנוהל הבא
          </Link>
        ) : null}
      </div>
    </div>
  );
}
