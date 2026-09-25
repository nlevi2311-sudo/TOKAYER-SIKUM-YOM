"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { DOC_TYPE_LABELS, docTypeLabel, RESOURCE_TYPE_LABELS, ROLE_LABELS, ROLES } from "@/lib/labels";
import { matchesQuery } from "@/lib/text";
import type { AppRole, Category, Resource, ResourceType } from "@/types";
import { FilterChips } from "./filter-chips";
import { ListToolbar, type ViewMode } from "./list-toolbar";
import { ResourceCard, ResourceRow } from "./resource-card";

type Mode = "procedures" | "forms" | "systems" | "library";

const PLACEHOLDERS: Record<Mode, string> = {
  procedures: "חיפוש נוהל",
  forms: "חיפוש טופס",
  systems: "חיפוש מערכת",
  library: "חיפוש מסמך",
};

const EMPTY_TEXT: Record<Mode, string> = {
  procedures: "עדיין לא הוזנו נהלים",
  forms: "עדיין לא הוזנו טפסים",
  systems: "עדיין לא הוזנו מערכות",
  library: "עדיין אין מסמכים",
};

function SelectFilter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-xl border bg-card pe-8 ps-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
      >
        <option value="">{label}: הכל</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** מעדכן את כתובת הדף בלי טעינה, כדי שאפשר יהיה לשתף קישור לקטגוריה */
function syncCategoryToUrl(slug: string) {
  const url = new URL(window.location.href);
  if (slug) url.searchParams.set("category", slug);
  else url.searchParams.delete("category");
  window.history.replaceState(null, "", url);
}

export function ResourceBrowser({
  resources,
  categories,
  mode,
  initialCategory = "",
}: {
  resources: Resource[];
  categories: Category[];
  mode: Mode;
  initialCategory?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [view, setView] = useLocalStorage<ViewMode>(`view:${mode}`, mode === "library" ? "list" : "cards");
  const [type, setType] = useState("");
  const [docType, setDocType] = useState("");
  const [role, setRole] = useState("");
  const [sort, setSort] = useState<"order" | "updated" | "title">("order");

  const isLibrary = mode === "library";

  // בספרייה: קטגוריות מכל הסוגים, רק כאלה שיש בהן פריטים
  const chips = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of resources) if (r.category) counts.set(r.category.slug, (counts.get(r.category.slug) ?? 0) + 1);
    const source = isLibrary
      ? Array.from(
          new Map(resources.filter((r) => r.category).map((r) => [r.category!.slug, r.category!.name])).entries(),
        ).map(([slug, name]) => ({ slug, name }))
      : categories;
    return source
      .filter((c) => (counts.get(c.slug) ?? 0) > 0 || !isLibrary)
      .map((c) => ({ value: c.slug, label: c.name, count: counts.get(c.slug) ?? 0 }));
  }, [resources, categories, isLibrary]);

  const docTypes = useMemo(
    () => Array.from(new Set(resources.map((r) => r.doc_type).filter((d): d is string => Boolean(d)))),
    [resources],
  );
  const types = useMemo(() => Array.from(new Set(resources.map((r) => r.type))), [resources]);

  const filtered = useMemo(() => {
    const list = resources.filter(
      (r) =>
        (!category || r.category?.slug === category) &&
        (!favoritesOnly || r.isFavorite) &&
        (!type || r.type === type) &&
        (!docType || r.doc_type === docType) &&
        (!role || r.roles.length === 0 || r.roles.includes(role as AppRole)) &&
        matchesQuery(query, r.title, r.description, r.owner, r.category?.name, r.keywords),
    );
    if (sort === "updated") {
      return [...list].sort((a, b) =>
        (b.content_updated_at ?? b.updated_at).localeCompare(a.content_updated_at ?? a.updated_at),
      );
    }
    if (sort === "title") return [...list].sort((a, b) => a.title.localeCompare(b.title, "he"));
    // ברירת מחדל: מוצמדים קודם, ואז לפי הסדר שנקבע בניהול
    return [...list].sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned) || a.sort_order - b.sort_order);
  }, [resources, category, favoritesOnly, type, docType, role, query, sort]);

  const hasFilters = Boolean(query || category || favoritesOnly || type || docType || role);

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <ListToolbar
          query={query}
          onQuery={setQuery}
          placeholder={PLACEHOLDERS[mode]}
          favoritesOnly={favoritesOnly}
          onFavoritesOnly={setFavoritesOnly}
          view={view}
          onView={setView}
        >
          {isLibrary ? (
            <>
              <SelectFilter
                label="סוג"
                value={type}
                onChange={setType}
                options={types.map((t) => ({ value: t, label: RESOURCE_TYPE_LABELS[t as ResourceType] }))}
              />
              <SelectFilter
                label="סוג קובץ"
                value={docType}
                onChange={setDocType}
                options={docTypes.map((d) => ({ value: d, label: docTypeLabel(d) || (DOC_TYPE_LABELS as Record<string, string>)[d] || d }))}
              />
              <SelectFilter
                label="תפקיד"
                value={role}
                onChange={setRole}
                options={ROLES.filter((r) => r !== "admin").map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
              />
              <label>
                <span className="sr-only">מיון</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as typeof sort)}
                  className="h-11 rounded-xl border bg-card pe-8 ps-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                >
                  <option value="order">מיון: ברירת מחדל</option>
                  <option value="updated">מיון: עודכן לאחרונה</option>
                  <option value="title">מיון: לפי שם</option>
                </select>
              </label>
            </>
          ) : null}
        </ListToolbar>

        {chips.length > 0 ? (
          <FilterChips
            label="קטגוריות"
            chips={chips}
            value={category}
            onChange={(v) => {
              setCategory(v);
              syncCategoryToUrl(v);
            }}
          />
        ) : null}
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {filtered.length} פריטים
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          icon={hasFilters ? "search" : "folder-open"}
          title={hasFilters ? "לא נמצאו פריטים" : EMPTY_TEXT[mode]}
          description={
            hasFilters
              ? "נסו מילה אחרת או נקו את הסינון."
              : "ההנהלה מוסיפה פריטים דרך ממשק הניהול. הם יופיעו כאן מיד."
          }
          action={
            hasFilters ? (
              <button
                type="button"
                className="text-sm font-semibold text-primary hover:underline"
                onClick={() => {
                  setQuery("");
                  setCategory("");
                  setFavoritesOnly(false);
                  setType("");
                  setDocType("");
                  setRole("");
                  syncCategoryToUrl("");
                }}
              >
                ניקוי הסינון
              </button>
            ) : undefined
          }
        />
      ) : view === "cards" ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r) => (
            <li key={r.id}>
              <ResourceCard resource={r} showType={isLibrary} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
          {filtered.map((r) => (
            <ResourceRow key={r.id} resource={r} showType={isLibrary} />
          ))}
        </ul>
      )}
    </div>
  );
}
