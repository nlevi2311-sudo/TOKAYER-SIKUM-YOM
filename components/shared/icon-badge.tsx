import { cn } from "@/lib/utils";
import { DynamicIcon } from "./dynamic-icon";
import type { IconName } from "@/lib/icons";

const tones = {
  teal: "bg-brand-soft text-primary",
  warm: "bg-warm-soft text-warm",
  emergency: "bg-emergency-soft text-emergency",
  white: "bg-white/15 text-white",
  muted: "bg-muted text-muted-foreground",
} as const;

const sizes = {
  sm: "size-9 rounded-lg [&_svg]:size-4",
  md: "size-11 rounded-xl [&_svg]:size-5",
  lg: "size-14 rounded-2xl [&_svg]:size-6",
} as const;

export function IconBadge({
  name,
  fallback,
  tone = "teal",
  size = "md",
  className,
}: {
  name: string | null | undefined;
  fallback?: IconName;
  tone?: keyof typeof tones;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center", tones[tone], sizes[size], className)}>
      <DynamicIcon name={name} fallback={fallback} strokeWidth={1.75} />
    </span>
  );
}
