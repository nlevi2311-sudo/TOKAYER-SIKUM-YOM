"use client";

import { Children, useState, type ReactNode } from "react";
import { ANNOUNCEMENT_KIND_LABELS, ANNOUNCEMENT_KINDS } from "@/lib/labels";
import type { Announcement } from "@/types";
import { FilterChips } from "./filter-chips";

/** סינון הפיד לפי סוג הודעה. הכרטיסים עצמם מרונדרים בשרת */
export function UpdatesFilter({ items, children }: { items: Announcement[]; children: ReactNode }) {
  const [kind, setKind] = useState("");
  const cards = Children.toArray(children);
  const kinds = ANNOUNCEMENT_KINDS.filter((k) => items.some((i) => i.kind === k));

  return (
    <div className="space-y-4">
      <FilterChips
        label="סוג עדכון"
        value={kind}
        onChange={setKind}
        chips={[
          { value: "important", label: "חשוב" },
          ...kinds.map((k) => ({ value: k, label: ANNOUNCEMENT_KIND_LABELS[k] })),
        ]}
      />
      <div className="space-y-3">
        {cards.filter((_, i) => {
          const item = items[i];
          if (!kind) return true;
          if (kind === "important") return item.is_important;
          return item.kind === kind;
        })}
      </div>
    </div>
  );
}
