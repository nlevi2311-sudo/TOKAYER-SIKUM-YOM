import type { ReactNode } from "react";
import { IconBadge } from "@/components/shared/icon-badge";
import type { IconName } from "@/lib/icons";
import { cn } from "@/lib/utils";

/** רשימת פריטים בכרטיס אחד. בטלפון כל שורה נפרשת לכרטיס קטן */
export function AdminList({ children, className, label }: { children: ReactNode; className?: string; label?: string }) {
  return (
    <ul aria-label={label} className={cn("divide-y overflow-hidden rounded-2xl border bg-card", className)}>
      {children}
    </ul>
  );
}

export function AdminListItem({
  icon,
  iconFallback,
  iconTone = "teal",
  title,
  titleExtra,
  subtitle,
  meta,
  controls,
  actions,
  muted,
  className,
}: {
  icon?: string | null;
  iconFallback?: IconName;
  iconTone?: "teal" | "warm" | "emergency" | "muted";
  title: ReactNode;
  /** תגיות ליד הכותרת */
  titleExtra?: ReactNode;
  subtitle?: ReactNode;
  /** שורת מידע קטנה: קטגוריה, הרשאות וכו׳ */
  meta?: ReactNode;
  /** מתגים או בקרות שמופיעים לפני כפתורי הפעולה */
  controls?: ReactNode;
  actions?: ReactNode;
  muted?: boolean;
  className?: string;
}) {
  return (
    <li
      className={cn(
        "flex flex-col gap-3 p-4 transition-colors hover:bg-surface/60 md:flex-row md:items-center md:gap-4",
        muted && "bg-muted/30",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {icon !== undefined ? <IconBadge name={icon} fallback={iconFallback} tone={iconTone} size="sm" /> : null}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className={cn("font-semibold leading-snug", muted && "text-muted-foreground")}>{title}</p>
            {titleExtra}
          </div>
          {subtitle ? <div className="line-clamp-2 text-sm text-muted-foreground">{subtitle}</div> : null}
          {meta ? <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs text-muted-foreground">{meta}</div> : null}
        </div>
      </div>
      {controls || actions ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 md:justify-end md:border-0 md:pt-0">
          {controls}
          {actions}
        </div>
      ) : null}
    </li>
  );
}

/** כותרת לקבוצה ברשימה מקובצת (לפי אזור, שלב וכו׳) */
export function ListGroup({
  title,
  description,
  count,
  action,
  children,
  id,
}: {
  title: string;
  description?: string;
  count?: number;
  action?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section aria-labelledby={id ? `${id}-title` : undefined} className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id={id ? `${id}-title` : undefined} className="flex items-center gap-2 text-lg font-bold text-foreground">
            {title}
            {count !== undefined ? (
              <span className="rounded-full bg-muted px-2 text-xs font-medium text-muted-foreground tabular-nums">{count}</span>
            ) : null}
          </h2>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** הערה בולטת בראש עמוד */
export function Notice({
  tone = "teal",
  icon,
  title,
  children,
  className,
}: {
  tone?: "teal" | "warm" | "emergency";
  icon?: ReactNode;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  const tones = {
    teal: "border-primary/20 bg-brand-soft text-foreground",
    warm: "border-warm/25 bg-warm-soft text-foreground",
    emergency: "border-emergency/30 bg-emergency-soft text-foreground",
  } as const;
  return (
    <div role="note" className={cn("flex gap-3 rounded-2xl border p-4 text-sm", tones[tone], className)}>
      {icon ? <span className="mt-0.5 shrink-0 [&_svg]:size-5">{icon}</span> : null}
      <div className="space-y-1">
        {title ? <p className="font-bold">{title}</p> : null}
        {children ? <div className="leading-relaxed text-foreground/85">{children}</div> : null}
      </div>
    </div>
  );
}
