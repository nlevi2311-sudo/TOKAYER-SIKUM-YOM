import Link from "next/link";
import { ArrowUpLeft } from "lucide-react";
import { ANNOUNCEMENT_KIND_LABELS } from "@/lib/labels";
import { formatDate, formatRelative } from "@/lib/text";
import { cn } from "@/lib/utils";
import type { Announcement } from "@/types";

export function AnnouncementCard({ item, compact = false }: { item: Announcement; compact?: boolean }) {
  return (
    <article
      id={item.id}
      className={cn(
        "scroll-mt-28 rounded-2xl border bg-card p-4 sm:p-5",
        item.is_important && "border-warm/30 bg-gradient-to-l from-warm-soft/60 to-card",
      )}
    >
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {item.is_important ? (
          <span className="rounded-full bg-warm px-2 py-0.5 font-semibold text-white">חשוב</span>
        ) : null}
        <span className="rounded-full bg-brand-soft px-2 py-0.5 font-medium text-primary">
          {ANNOUNCEMENT_KIND_LABELS[item.kind]}
        </span>
        <time dateTime={item.published_at} className="text-muted-foreground" title={formatDate(item.published_at)}>
          {formatRelative(item.published_at)}
        </time>
      </div>
      <h3 className="mt-2 font-bold leading-snug">{item.title}</h3>
      {item.body ? (
        <p className={cn("mt-1.5 whitespace-pre-line text-sm leading-relaxed text-muted-foreground", compact && "line-clamp-2")}>
          {item.body}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{item.author_name ? `פורסם על ידי ${item.author_name}` : null}</span>
        {item.link_url ? (
          <Link
            href={item.link_url}
            target={item.link_url.startsWith("/") ? undefined : "_blank"}
            rel="noopener"
            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
          >
            לפרטים <ArrowUpLeft className="size-3.5" />
          </Link>
        ) : null}
      </div>
    </article>
  );
}
