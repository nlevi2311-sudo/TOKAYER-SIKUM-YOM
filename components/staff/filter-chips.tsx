"use client";

import { cn } from "@/lib/utils";

export type Chip = { value: string; label: string; count?: number };

/** שורת סינון אופקית. גוללת לרוחב במובייל */
export function FilterChips({
  label,
  chips,
  value,
  onChange,
  allLabel = "הכל",
}: {
  label: string;
  chips: Chip[];
  value: string;
  onChange: (value: string) => void;
  allLabel?: string;
}) {
  const all: Chip[] = [{ value: "", label: allLabel }, ...chips];
  return (
    <div role="group" aria-label={label} className="-mx-4 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0">
      <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
        {all.map((chip) => {
          const active = chip.value === value;
          return (
            <button
              key={chip.value || "all"}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(chip.value)}
              className={cn(
                "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm transition",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card text-foreground/80 hover:border-primary/40 hover:text-foreground",
              )}
            >
              {chip.label}
              {typeof chip.count === "number" ? (
                <span className={cn("text-xs", active ? "text-primary-foreground/80" : "text-muted-foreground")}>
                  {chip.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
