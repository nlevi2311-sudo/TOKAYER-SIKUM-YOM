import type { ReactNode } from "react";
import { ROLE_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { AppRole } from "@/types";

const tones = {
  teal: "bg-brand-soft text-primary",
  warm: "bg-warm-soft text-warm",
  success: "bg-success/10 text-success",
  warning: "bg-highlight/15 text-[#8a5a00]",
  emergency: "bg-emergency-soft text-emergency",
  muted: "bg-muted text-muted-foreground",
  outline: "border bg-background text-muted-foreground",
} as const;

export type BadgeTone = keyof typeof tones;

export function StatusBadge({
  tone = "teal",
  children,
  className,
  title,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] leading-5 font-medium whitespace-nowrap [&_svg]:size-3",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** מי רואה את הפריט. בלי תפקידים = כל הצוות */
export function RoleBadges({ roles, className }: { roles: readonly AppRole[]; className?: string }) {
  if (roles.length === 0) {
    return (
      <StatusBadge tone="outline" className={className}>
        כל הצוות
      </StatusBadge>
    );
  }
  return (
    <>
      {roles.map((r) => (
        <StatusBadge key={r} tone="muted" className={className}>
          {ROLE_LABELS[r]}
        </StatusBadge>
      ))}
    </>
  );
}
