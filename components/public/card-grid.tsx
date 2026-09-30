import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { CardItem } from "@/config/public-content";
import { IconBadge } from "@/components/shared/icon-badge";
import { cn } from "@/lib/utils";

const columnClasses = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
} as const;

/** רשת כרטיסים: אייקון, כותרת ותיאור */
export function CardGrid({
  items,
  columns = 3,
  className,
  cardClassName,
}: {
  items: CardItem[];
  columns?: keyof typeof columnClasses;
  className?: string;
  cardClassName?: string;
}) {
  if (items.length === 0) return null;
  return (
    <ul role="list" className={cn("grid gap-4 sm:gap-5", columnClasses[columns], className)}>
      {items.map((item, i) => (
        <li
          key={`${item.title}-${i}`}
          className={cn(
            "card-lift flex gap-4 rounded-3xl border border-border/70 bg-card p-5 sm:block sm:p-7",
            cardClassName,
          )}
        >
          <IconBadge name={item.icon} fallback="sparkles" size="lg" />
          <div className="min-w-0 sm:mt-5">
            <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
            {item.description ? <p className="mt-1.5 leading-7 text-muted-foreground sm:mt-2">{item.description}</p> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

export type LinkCard = { href: string; title: string; description: string; icon: string; cta: string };

/** כרטיסי קישור לעמודים פנימיים */
export function LinkCardGrid({ items, className }: { items: LinkCard[]; className?: string }) {
  return (
    <ul role="list" className={cn("grid gap-4 sm:grid-cols-2 sm:gap-5", className)}>
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="card-lift group flex h-full flex-col rounded-3xl border border-border/70 bg-card p-6 sm:p-8"
          >
            <IconBadge name={item.icon} fallback="sparkles" size="lg" />
            <h3 className="mt-5 text-xl font-bold text-primary">{item.title}</h3>
            {item.description ? <p className="mt-2 flex-1 leading-7 text-muted-foreground">{item.description}</p> : null}
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
              {item.cta}
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
