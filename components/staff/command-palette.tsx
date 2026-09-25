"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { DynamicIcon } from "@/components/shared/dynamic-icon";
import { useStaffSearch } from "@/hooks/use-staff-search";
import { cn } from "@/lib/utils";
import { SEARCH_KIND_META } from "./search-kind";
import { STAFF_NAV_CONTENT, STAFF_NAV_MAIN } from "./nav";

/** חיפוש מהיר מכל מקום: Ctrl+K או / */
export function CommandPalette({ className }: { className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { results, pending } = useStaffSearch(query);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function navigate(href: string, external: boolean) {
    setOpen(false);
    setQuery("");
    if (external) window.open(href, "_blank", "noopener");
    else router.push(href);
  }

  const hasQuery = query.trim().length >= 2;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-10 w-full max-w-md items-center gap-2 rounded-xl border bg-surface px-3 text-sm text-muted-foreground transition hover:border-primary/40 hover:bg-card",
          className,
        )}
        aria-label="חיפוש מהיר"
      >
        <Search className="size-4 text-primary" aria-hidden="true" />
        <span className="flex-1 text-start">מה אתה מחפש?</span>
        <kbd className="hidden rounded border bg-card px-1.5 font-sans text-[11px] sm:inline" dir="ltr">
          Ctrl K
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="חיפוש מהיר"
        description="חיפוש נהלים, טפסים, מערכות, הדרכות ואנשי קשר"
        shouldFilter={false}
      >
        <CommandInput placeholder="מה אתה מחפש?" value={query} onValueChange={setQuery} />
        <CommandList>
          {hasQuery ? (
            <>
              {pending && results.length === 0 ? (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> מחפש...
                </div>
              ) : (
                <CommandEmpty>לא נמצאו תוצאות</CommandEmpty>
              )}
              {results.length > 0 ? (
                <CommandGroup heading="תוצאות">
                  {results.map((hit) => (
                    <CommandItem
                      key={`${hit.kind}-${hit.id}`}
                      value={`${hit.kind}-${hit.id}`}
                      onSelect={() => navigate(hit.href, hit.external)}
                    >
                      <DynamicIcon name={SEARCH_KIND_META[hit.kind].icon} className="text-primary" />
                      <span className="flex-1 truncate">{hit.title}</span>
                      <span className="text-xs text-muted-foreground">{SEARCH_KIND_META[hit.kind].label}</span>
                    </CommandItem>
                  ))}
                  <CommandItem
                    value="all-results"
                    onSelect={() => navigate(`/staff/search?q=${encodeURIComponent(query.trim())}`, false)}
                  >
                    <Search className="text-primary" />
                    כל התוצאות עבור &quot;{query.trim()}&quot;
                  </CommandItem>
                </CommandGroup>
              ) : null}
            </>
          ) : (
            <CommandGroup heading="מעבר מהיר">
              {[...STAFF_NAV_MAIN, ...STAFF_NAV_CONTENT].map((item) => (
                <CommandItem key={item.href} value={item.href} onSelect={() => navigate(item.href, false)}>
                  <DynamicIcon name={item.icon} className="text-primary" />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
