"use client";

import type { ReactNode } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** שורת כלים מעל רשימה: חיפוש, מסננים ומספר תוצאות */
export function DataToolbar({
  query,
  onQueryChange,
  placeholder = "חיפוש",
  count,
  children,
  className,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder?: string;
  count?: number;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="relative w-full sm:max-w-sm">
        <Search
          className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-10 rounded-xl bg-background ps-9 pe-9 [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            aria-label="ניקוי החיפוש"
            className="absolute end-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        {count !== undefined ? (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {count === 1 ? "פריט אחד" : `${count} פריטים`}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** מסנן בצורת כפתורי גלולה, עם מונה לכל אפשרות */
export function FilterPills<V extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: V;
  onChange: (value: V) => void;
  options: Array<{ value: V; label: string; count?: number }>;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="scrollbar-none -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-background text-foreground/80 hover:border-primary/40 hover:text-primary",
            )}
          >
            {o.label}
            {o.count !== undefined ? (
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs tabular-nums",
                  active ? "bg-white/20" : "bg-muted text-muted-foreground",
                )}
              >
                {o.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
