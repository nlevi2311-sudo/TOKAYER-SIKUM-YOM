"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { OgdanGate, Procedure } from "@/lib/content/lomda-types";
import { ProcedureBody, pad2 } from "./content-blocks";

function haystack(p: Procedure): string {
  return [
    p.t,
    ...p.acts,
    ...Object.values(p.meta),
    ...(p.tbl ? p.tbl.rows.flat() : []),
  ].join(" ");
}

/** האוגדן בכיס: חיפוש, סינון לפי שער ופתיחת נוהל במקום */
export function OgdanBrowser({ gates, procedures }: { gates: OgdanGate[]; procedures: Procedure[] }) {
  const [query, setQuery] = useState("");
  const [gate, setGate] = useState(0);
  const index = useMemo(() => procedures.map((p) => ({ p, text: haystack(p) })), [procedures]);

  const q = query.trim();
  const visible = index
    .filter(({ p, text }) => (gate ? p.g === gate : true) && (!q || text.includes(q) || String(p.n) === q))
    .map(({ p }) => p);

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <label className="relative block">
          <span className="sr-only">חיפוש באוגדן</span>
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש: תרופות, בריחה, ארוחות, חופשה..."
            className="h-11 ps-9"
          />
        </label>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="סינון לפי שער">
          {[{ n: 0, t: "הכל" }, ...gates].map((g) => (
            <button
              key={g.n}
              type="button"
              aria-pressed={gate === g.n}
              onClick={() => setGate(g.n)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm transition",
                gate === g.n ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary",
              )}
            >
              {g.n ? `${pad2(g.n)} ${g.t}` : g.t}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {visible.length ? `${visible.length} נהלים` : "לא נמצא נוהל. נסו מילה אחרת."}
        </p>
      </div>

      {gates
        .filter((g) => visible.some((p) => p.g === g.n))
        .map((g) => (
          <section key={g.n} className="space-y-2" aria-label={`שער ${pad2(g.n)}`}>
            <div>
              <h2 className="text-lg font-bold text-primary">
                שער {pad2(g.n)} · {g.t}
              </h2>
              <p className="text-sm text-muted-foreground">{g.d}</p>
            </div>
            {visible
              .filter((p) => p.g === g.n)
              .map((p) => (
                <details key={p.n} id={`p${p.n}`} className="group rounded-2xl border bg-card">
                  <summary className="flex cursor-pointer list-none items-baseline gap-3 p-4 font-semibold [&::-webkit-details-marker]:hidden">
                    <span className="shrink-0 tabular-nums text-primary">{pad2(p.n)}</span>
                    <span className="flex-1">{p.t}</span>
                    <ChevronDown className="size-4 shrink-0 self-center text-primary transition group-open:rotate-180" />
                  </summary>
                  <div className="space-y-3 border-t px-4 pb-4 pt-3">
                    <ProcedureBody procedure={p} />
                    <Link href={`/staff/ogdan/${p.n}`} className="inline-block text-sm font-semibold text-primary hover:underline">
                      קישור ישיר לנוהל
                    </Link>
                  </div>
                </details>
              ))}
          </section>
        ))}
    </div>
  );
}
