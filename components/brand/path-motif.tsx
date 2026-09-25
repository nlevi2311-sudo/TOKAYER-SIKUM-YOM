import { cn } from "@/lib/utils";

/**
 * מוטיב המסלול מספר המותג: קווים דקים וקשתות, גדול, חלקי ושקוף, בשולי הקומפוזיציה.
 * לא מאחורי טקסט צפוף ולא כדפוס חוזר.
 */
export function PathMotif({
  className,
  tone = "color",
}: {
  className?: string;
  tone?: "color" | "light";
}) {
  const id = tone === "light" ? "pm-light" : "pm-color";
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 600 600"
      fill="none"
      className={cn("pointer-events-none select-none", className)}
    >
      <defs>
        <linearGradient id={`${id}-a`} x1="0" y1="0" x2="1" y2="1">
          {tone === "light" ? (
            <>
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity="0.55" />
              <stop offset="70%" stopColor="var(--brand-aqua)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--brand-accent)" stopOpacity="0.35" />
            </>
          )}
        </linearGradient>
        <linearGradient id={`${id}-b`} x1="1" y1="0" x2="0" y2="1">
          {tone === "light" ? (
            <>
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="var(--brand-lime)" stopOpacity="0.45" />
              <stop offset="100%" stopColor="var(--brand-mint)" stopOpacity="0.2" />
            </>
          )}
        </linearGradient>
      </defs>
      <path
        d="M560 120C470 40 300 30 190 110C60 205 40 390 150 480C250 560 420 545 520 450"
        stroke={`url(#${id}-a)`}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M590 260C520 170 380 140 280 200C170 265 150 420 250 500"
        stroke={`url(#${id}-b)`}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
