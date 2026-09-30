"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { DynamicIcon } from "@/components/shared/dynamic-icon";
import { ICON_NAMES } from "@/lib/icons";
import { cn } from "@/lib/utils";

const COLUMNS = 6;

/** בחירת אייקון מתוך מאגר האייקונים של המערכת, עם חיפוש לפי שם באנגלית */
export function IconPicker({
  id,
  value,
  onChange,
  disabled,
  describedBy,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  describedBy?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const gridRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? ICON_NAMES.filter((n) => n.includes(q)) : ICON_NAMES;
  }, [query]);

  function select(name: string) {
    onChange(name);
    setOpen(false);
    setQuery("");
  }

  /** ניווט בחצים בתוך רשת האייקונים */
  function onGridKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const buttons = Array.from(gridRef.current?.querySelectorAll<HTMLButtonElement>("button[data-icon]") ?? []);
    const index = buttons.findIndex((b) => b === document.activeElement);
    if (index < 0) return;
    const step: Record<string, number> = { ArrowLeft: 1, ArrowRight: -1, ArrowDown: COLUMNS, ArrowUp: -COLUMNS };
    const delta = step[e.key];
    if (delta === undefined) return;
    e.preventDefault();
    buttons[Math.min(Math.max(index + delta, 0), buttons.length - 1)]?.focus();
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-2">
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            disabled={disabled}
            aria-describedby={describedBy}
            aria-haspopup="dialog"
            className="flex h-9 min-w-44 items-center gap-2 rounded-md border bg-background px-2.5 text-sm shadow-xs transition hover:bg-accent disabled:opacity-50"
          >
            <span className="inline-flex size-6 items-center justify-center rounded-md bg-brand-soft text-primary">
              <DynamicIcon name={value || null} fallback="circle-help" className="size-4" />
            </span>
            <span dir="ltr" className={cn("flex-1 text-start", !value && "text-muted-foreground")}>
              {value || "ללא אייקון"}
            </span>
            <ChevronDown className="size-4 opacity-50" aria-hidden="true" />
          </button>
        </PopoverTrigger>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            disabled={disabled}
            aria-label="הסרת האייקון"
            title="הסרת האייקון"
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>
      <PopoverContent align="start" className="w-80 p-3">
        <div className="relative mb-2">
          <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש באנגלית, למשל heart"
            aria-label="חיפוש אייקון"
            className="ps-8"
            dir="auto"
          />
        </div>
        <div
          ref={gridRef}
          role="group"
          aria-label="אייקונים"
          onKeyDown={onGridKeyDown}
          className="grid max-h-64 grid-cols-6 gap-1 overflow-y-auto p-0.5"
        >
          {filtered.map((name) => {
            const selected = name === value;
            return (
              <button
                key={name}
                type="button"
                data-icon={name}
                onClick={() => select(name)}
                aria-label={name}
                aria-pressed={selected}
                title={name}
                className={cn(
                  "inline-flex aspect-square items-center justify-center rounded-lg text-foreground/80 transition hover:bg-brand-soft hover:text-primary",
                  selected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                )}
              >
                <DynamicIcon name={name} className="size-5" strokeWidth={1.75} />
              </button>
            );
          })}
          {filtered.length === 0 ? (
            <p className="col-span-6 py-6 text-center text-sm text-muted-foreground">לא נמצאו אייקונים</p>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
