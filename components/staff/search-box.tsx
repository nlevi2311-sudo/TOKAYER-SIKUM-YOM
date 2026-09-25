"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import { useStaffSearch } from "@/hooks/use-staff-search";
import { IconBadge } from "@/components/shared/icon-badge";
import { cn } from "@/lib/utils";
import { SEARCH_KIND_META } from "./search-kind";

/**
 * תיבת החיפוש הגדולה של אזור הצוות, עם תוצאות חיות.
 * Enter בלי בחירה עובר לעמוד תוצאות מלא.
 */
export function SearchBox({
  defaultValue = "",
  autoFocus = false,
  className,
  size = "lg",
}: {
  defaultValue?: string;
  autoFocus?: boolean;
  className?: string;
  size?: "lg" | "md";
}) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const { results, status, pending, error } = useStaffSearch(query);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const showPanel = open && query.trim().length >= 2;

  function go(index: number) {
    const hit = results[index];
    if (!hit) return;
    setOpen(false);
    if (hit.external) window.open(hit.href, "_blank", "noopener");
    else router.push(hit.href);
  }

  return (
    <div className={cn("relative", className)}>
      <form
        role="search"
        action="/staff/search"
        onSubmit={(e) => {
          if (active >= 0 && results[active]) {
            e.preventDefault();
            go(active);
          }
        }}
      >
        <label htmlFor={`${listId}-input`} className="sr-only">
          חיפוש באזור הצוות
        </label>
        <div
          className={cn(
            "flex items-center gap-3 rounded-2xl border bg-card shadow-sm transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10",
            size === "lg" ? "h-14 px-4 sm:h-16 sm:px-5" : "h-11 px-3",
          )}
        >
          {pending && query.trim().length >= 2 ? (
            <Loader2 className="size-5 shrink-0 animate-spin text-primary" aria-hidden="true" />
          ) : (
            <Search className="size-5 shrink-0 text-primary" aria-hidden="true" />
          )}
          <input
            ref={inputRef}
            id={`${listId}-input`}
            name="q"
            type="search"
            autoComplete="off"
            autoFocus={autoFocus}
            enterKeyHint="search"
            placeholder="מה אתה מחפש?"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActive(-1);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((i) => Math.min(i + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((i) => Math.max(i - 1, -1));
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            role="combobox"
            aria-expanded={showPanel}
            aria-controls={listId}
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            className={cn(
              "min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden",
              size === "lg" ? "text-base sm:text-lg" : "text-sm",
            )}
          />
          {query ? (
            <button
              type="button"
              aria-label="ניקוי החיפוש"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
      </form>

      {showPanel ? (
        <div className="absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border bg-popover shadow-xl shadow-primary/5 animate-fade-up">
          {status === "error" ? (
            <p className="p-4 text-sm text-destructive">{error}</p>
          ) : results.length === 0 && !pending ? (
            <p className="p-4 text-sm text-muted-foreground">לא נמצאו תוצאות עבור &quot;{query.trim()}&quot;</p>
          ) : (
            <ul id={listId} role="listbox" aria-label="תוצאות חיפוש" className="max-h-[60vh] overflow-y-auto p-1.5">
              {results.map((hit, i) => {
                const meta = SEARCH_KIND_META[hit.kind];
                return (
                  <li key={`${hit.kind}-${hit.id}`} id={`${listId}-${i}`} role="option" aria-selected={active === i}>
                    <Link
                      href={hit.href}
                      target={hit.external ? "_blank" : undefined}
                      rel={hit.external ? "noopener" : undefined}
                      onMouseEnter={() => setActive(i)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5",
                        active === i ? "bg-accent" : "hover:bg-accent/60",
                      )}
                    >
                      <IconBadge name={meta.icon} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{hit.title}</span>
                        {hit.subtitle ? (
                          <span className="block truncate text-xs text-muted-foreground">{hit.subtitle}</span>
                        ) : null}
                      </span>
                      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {meta.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <Link
            href={`/staff/search?q=${encodeURIComponent(query.trim())}`}
            className="block border-t px-4 py-2.5 text-sm font-medium text-primary hover:bg-accent/60"
          >
            כל התוצאות
          </Link>
        </div>
      ) : null}
    </div>
  );
}
