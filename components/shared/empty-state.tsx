import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { IconBadge } from "./icon-badge";

export function EmptyState({
  icon = "folder-open",
  title,
  description,
  action,
  className,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-surface/60 px-6 py-12 text-center",
        className,
      )}
    >
      <IconBadge name={icon} size="lg" tone="muted" />
      <div className="space-y-1">
        <p className="font-semibold">{title}</p>
        {description ? <p className="mx-auto max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
