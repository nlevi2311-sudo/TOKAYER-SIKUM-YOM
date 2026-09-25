"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { matchesQuery } from "@/lib/text";
import { cn } from "@/lib/utils";
import type { Category, TrainingItem } from "@/types";
import { FilterChips } from "./filter-chips";
import { ListToolbar } from "./list-toolbar";
import { TrainingCard } from "./training-card";

export function TrainingBrowser({
  items,
  categories,
  initialCategory = "",
}: {
  items: TrainingItem[];
  categories: Category[];
  initialCategory?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [mandatoryOnly, setMandatoryOnly] = useState(false);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of items) if (t.category) m.set(t.category.slug, (m.get(t.category.slug) ?? 0) + 1);
    return m;
  }, [items]);

  const filtered = items.filter(
    (t) =>
      (!category || t.category?.slug === category) &&
      (!favoritesOnly || t.isFavorite) &&
      (!mandatoryOnly || t.is_mandatory) &&
      matchesQuery(query, t.title, t.summary, t.category?.name, t.keywords),
  );

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <ListToolbar
          query={query}
          onQuery={setQuery}
          placeholder="חיפוש הדרכה"
          favoritesOnly={favoritesOnly}
          onFavoritesOnly={setFavoritesOnly}
        >
          <button
            type="button"
            aria-pressed={mandatoryOnly}
            onClick={() => setMandatoryOnly(!mandatoryOnly)}
            className={cn(
              "inline-flex h-11 items-center rounded-xl border px-3 text-sm transition",
              mandatoryOnly ? "border-warm bg-warm-soft text-warm" : "bg-card hover:border-primary/40",
            )}
          >
            הכשרות חובה
          </button>
        </ListToolbar>
        <FilterChips
          label="נושאי הדרכה"
          value={category}
          onChange={setCategory}
          chips={categories.map((c) => ({ value: c.slug, label: c.name, count: counts.get(c.slug) ?? 0 }))}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="graduation-cap"
          title={items.length === 0 ? "עדיין לא הועלו הדרכות" : "לא נמצאו הדרכות"}
          description={items.length === 0 ? undefined : "נסו נושא אחר או נקו את הסינון."}
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((t) => (
            <li key={t.id}>
              <TrainingCard item={t} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
