import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { IconBadge } from "@/components/shared/icon-badge";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBox } from "@/components/staff/search-box";
import { SEARCH_KIND_META } from "@/components/staff/search-kind";
import { searchAll, searchResultHref } from "@/lib/data/staff";
import type { SearchResult } from "@/types";

export const metadata: Metadata = { title: "חיפוש" };

const GROUP_ORDER: SearchResult["kind"][] = [
  "procedure",
  "form",
  "system",
  "document",
  "link",
  "training",
  "contact",
  "category",
  "announcement",
];

const SUGGESTIONS = ["בריחה", "חופשה", "תלם", "תרופות", "אירוע חריג", "משמרות"];

export default async function SearchPage({ searchParams }: PageProps<"/staff/search">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const results = query ? await searchAll(query, 60) : [];

  const groups = GROUP_ORDER.map((kind) => ({ kind, items: results.filter((r) => r.kind === kind) })).filter(
    (g) => g.items.length > 0,
  );

  return (
    <div className="space-y-6">
      <PageHeader title="חיפוש" breadcrumbs={[{ label: "בית", href: "/staff" }, { label: "חיפוש" }]} />
      <SearchBox defaultValue={query} autoFocus={!query} />

      {!query ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">מחפשים נהלים, טפסים, מערכות, הדרכות, אנשי קשר וקטגוריות. למשל:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <Link
                key={s}
                href={`/staff/search?q=${encodeURIComponent(s)}`}
                className="rounded-full border bg-card px-4 py-1.5 text-sm hover:border-primary/40 hover:text-primary"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          icon="search"
          title={`לא נמצאו תוצאות עבור "${query}"`}
          description="נסו מילה קצרה יותר או שם אחר. אם משהו חסר, עדכנו את ההנהלה."
        />
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {results.length} תוצאות עבור &quot;{query}&quot;
          </p>
          {groups.map((group) => {
            const meta = SEARCH_KIND_META[group.kind];
            return (
              <section key={group.kind} className="space-y-2" aria-label={meta.label}>
                <h2 className="text-sm font-bold text-warm">{meta.label}</h2>
                <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
                  {group.items.map((r) => {
                    const href = searchResultHref(r);
                    const external = href.startsWith("/staff/open/") && !r.url.startsWith("/");
                    const isPhone = r.url.startsWith("tel:");
                    return (
                      <li key={r.id}>
                        <Link
                          href={href}
                          target={external ? "_blank" : undefined}
                          rel={external ? "noopener" : undefined}
                          prefetch={external ? false : undefined}
                          className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-surface"
                        >
                          <IconBadge name={meta.icon} size="sm" />
                          <span className="min-w-0 flex-1">
                            <span className="block font-semibold">{r.title}</span>
                            {r.subtitle ? (
                              <span className="line-clamp-1 text-sm text-muted-foreground">{r.subtitle}</span>
                            ) : null}
                          </span>
                          {r.category ? (
                            <span className="hidden shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground sm:inline">
                              {r.category}
                            </span>
                          ) : null}
                          {isPhone ? <span className="shrink-0 text-xs font-semibold text-primary">חיוג</span> : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
