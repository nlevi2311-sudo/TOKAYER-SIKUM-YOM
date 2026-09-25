import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/** אזור בדף הבית של הצוות: כותרת, קישור "הכל" ותוכן */
export function DashboardSection({
  title,
  href,
  hrefLabel = "הכל",
  children,
  className,
}: {
  title: string;
  href?: string;
  hrefLabel?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-3", className)} aria-label={title}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-primary">{title}</h2>
        {href ? (
          <Link href={href} className="inline-flex items-center gap-0.5 rounded text-sm font-medium text-muted-foreground hover:text-primary">
            {hrefLabel}
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}
