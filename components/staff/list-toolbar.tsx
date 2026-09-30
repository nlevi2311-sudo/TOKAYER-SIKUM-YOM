"use client";

import { LayoutGrid, List, Search, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "cards" | "list";

/** חיפוש בתוך העמוד, מתג מועדפים ומתג תצוגה */
export function ListToolbar({
  query,
  onQuery,
  placeholder,
  favoritesOnly,
  onFavoritesOnly,
  view,
  onView,
  children,
}: {
  query: string;
  onQuery: (q: string) => void;
  placeholder: string;
  favoritesOnly?: boolean;
  onFavoritesOnly?: (v: boolean) => void;
  view?: ViewMode;
  onView?: (v: ViewMode) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-0 flex-1 basis-full sm:basis-64">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-11 w-full rounded-xl border bg-card ps-9 pe-9 text-[15px] outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <button
            type="button"
            onClick={() => onQuery("")}
            aria-label="ניקוי"
            className="absolute end-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>
      {children}
      {onFavoritesOnly ? (
        <button
          type="button"
          aria-pressed={favoritesOnly}
          onClick={() => onFavoritesOnly(!favoritesOnly)}
          className={cn(
            "inline-flex h-11 items-center gap-1.5 rounded-xl border px-3 text-sm transition",
            favoritesOnly ? "border-highlight bg-highlight/15 text-[#7a4f00]" : "bg-card hover:border-primary/40",
          )}
        >
          <Star className={cn("size-4", favoritesOnly && "fill-current text-highlight")} aria-hidden="true" />
          מועדפים
        </button>
      ) : null}
      {view && onView ? (
        <div role="group" aria-label="תצוגה" className="inline-flex h-11 rounded-xl border bg-card p-1">
          {(["cards", "list"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={view === mode}
              aria-label={mode === "cards" ? "תצוגת כרטיסים" : "תצוגת רשימה"}
              onClick={() => onView(mode)}
              className={cn(
                "inline-flex w-9 items-center justify-center rounded-lg transition",
                view === mode ? "bg-brand-soft text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {mode === "cards" ? <LayoutGrid className="size-4" /> : <List className="size-4" />}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
