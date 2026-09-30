import Link from "next/link";
import { Clock, FileText, Link2, Presentation, Video } from "lucide-react";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { IconBadge } from "@/components/shared/icon-badge";
import { PlaceholderBadge } from "@/components/shared/placeholder-badge";
import { isWithinDays } from "@/lib/text";
import { cn } from "@/lib/utils";
import type { TrainingItem } from "@/types";

// אותו סדר כמו primaryTrainingUrl: הכפתור הראשון עובר דרך /staff/open ונרשם ב"אחרונים"
const ASSETS = [
  { key: "link_url", label: "קישור", icon: Link2 },
  { key: "slides_url", label: "מצגת", icon: Presentation },
  { key: "video_url", label: "סרטון", icon: Video },
  { key: "file_url", label: "קובץ", icon: FileText },
] as const;

/** כרטיס הדרכה: תקציר ולחצנים לכל חומר שקיים (קובץ, מצגת, סרטון, קישור) */
export function TrainingCard({ item }: { item: TrainingItem }) {
  const assets = ASSETS.filter((a) => item[a.key]);
  const isNew = isWithinDays(item.created_at, 45);

  return (
    <article id={item.id} className="flex h-full scroll-mt-28 flex-col gap-4 rounded-2xl border bg-card p-5 target:ring-4 target:ring-primary/15">
      <div className="flex items-start gap-3">
        <IconBadge name="graduation-cap" />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xs text-muted-foreground">{item.category?.name ?? "הדרכה"}</p>
          <h3 className="font-bold leading-snug">{item.title}</h3>
        </div>
        <FavoriteButton kind="training" id={item.id} title={item.title} initial={Boolean(item.isFavorite)} className="-me-2 -mt-1" />
      </div>

      <div className="flex flex-wrap gap-1.5 text-[11px]">
        {item.is_mandatory ? (
          <span className="rounded-full bg-warm px-2 py-0.5 font-semibold text-white">חובה</span>
        ) : null}
        {isNew ? <span className="rounded-full bg-lime/30 px-2 py-0.5 font-semibold text-[#4d5c10]">חדש</span> : null}
        {item.duration_minutes ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
            <Clock className="size-3" aria-hidden="true" /> {item.duration_minutes} דקות
          </span>
        ) : null}
        {assets.some((a) => item[a.key]?.includes("example.com")) ? <PlaceholderBadge url="https://example.com" /> : null}
      </div>

      {item.summary ? (
        <details className="group text-sm leading-relaxed text-muted-foreground">
          <summary className="cursor-pointer list-none">
            <span className="line-clamp-2 group-open:line-clamp-none">{item.summary}</span>
            <span className="mt-1 inline-block text-xs font-semibold text-primary group-open:hidden">תקציר מלא</span>
          </summary>
        </details>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-2">
        {assets.length === 0 ? (
          <span className="text-sm text-muted-foreground">החומרים יעלו בקרוב</span>
        ) : (
          assets.map(({ key, label, icon: Icon }, i) => (
            <Link
              key={key}
              href={i === 0 ? `/staff/open/training/${item.id}` : (item[key] as string)}
              target="_blank"
              rel="noopener"
              prefetch={false}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-medium transition",
                i === 0 ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border bg-card hover:border-primary/40 hover:text-primary",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          ))
        )}
      </div>
    </article>
  );
}
