"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { chooseLomdaSetup } from "@/lib/actions/lomda";
import { cn } from "@/lib/utils";
import type { TrackKey } from "@/lib/content/lomda-types";

type TrackOption = { key: TrackKey; label: string; description: string };
type BitanOption = { key: string; name: string; color: string };

/** בחירת תפקיד וביתן. נשמר מיד בשרת. */
export function LomdaSetup({
  tracks,
  bitans,
  track,
  bitan,
}: {
  tracks: TrackOption[];
  bitans: BitanOption[];
  track: TrackKey | null;
  bitan: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [sel, setSel] = useState({ track, bitan });

  function save(next: { track: TrackKey | null; bitan: string | null }) {
    const prev = sel;
    setSel(next);
    startTransition(async () => {
      const res = await chooseLomdaSetup(next);
      if (!res.ok) {
        setSel(prev);
        toast.error(res.error);
      }
    });
  }

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-4 sm:p-5" aria-busy={pending}>
      <div className="space-y-2">
        <h2 className="font-bold">התפקיד שלך</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {tracks.map((t) => (
            <button
              key={t.key}
              type="button"
              aria-pressed={sel.track === t.key}
              onClick={() => save({ ...sel, track: t.key })}
              className={cn(
                "rounded-xl border-2 p-3 text-start transition",
                sel.track === t.key ? "border-primary bg-surface" : "hover:border-primary/50",
              )}
            >
              <span className="block font-bold">{t.label}</span>
              <span className="block text-sm text-muted-foreground">{t.description}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="font-bold">הביתן שלך</h2>
        <div className="grid grid-cols-3 gap-2">
          {bitans.map((b) => (
            <button
              key={b.key}
              type="button"
              aria-pressed={sel.bitan === b.key}
              onClick={() => save({ ...sel, bitan: b.key })}
              className={cn(
                "flex items-center gap-2 rounded-xl border-2 px-3 py-2 font-semibold transition",
                sel.bitan === b.key ? "border-primary bg-surface" : "hover:border-primary/50",
              )}
            >
              <span className="size-3.5 shrink-0 rounded-full" style={{ background: b.color }} aria-hidden="true" />
              {b.name}
            </button>
          ))}
          <button
            type="button"
            aria-pressed={sel.bitan === null}
            onClick={() => save({ ...sel, bitan: null })}
            className={cn(
              "col-span-3 rounded-xl border-2 px-3 py-2 transition",
              sel.bitan === null ? "border-primary bg-surface" : "hover:border-primary/50",
            )}
          >
            עוד לא שובצתי
          </button>
        </div>
        <p className="text-sm text-muted-foreground">אחרי בחירת ביתן נוספת יחידה על הביתן שלך: מי הילדים, מי הצוות ומה קבוע בשבוע.</p>
      </div>
    </section>
  );
}
