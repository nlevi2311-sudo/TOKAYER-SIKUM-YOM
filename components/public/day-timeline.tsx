import type { TimelineItem } from "@/config/public-content";
import { DynamicIcon } from "@/components/shared/dynamic-icon";
import { cn } from "@/lib/utils";

/**
 * ציר זמן אנכי של סדר היום.
 * בנייד: קו בצד ההתחלה והכרטיסים לצדו. במחשב: קו במרכז והכרטיסים לסירוגין משני הצדדים.
 */
export function DayTimeline({ items }: { items: TimelineItem[] }) {
  if (items.length === 0) return null;
  return (
    <ol role="list" className="relative mx-auto max-w-4xl">
      <span
        aria-hidden="true"
        className="absolute inset-y-5 start-5 w-px bg-linear-to-b from-primary/40 via-aqua/40 to-mint/30 lg:start-1/2"
      />
      {items.map((item, i) => {
        const first = i % 2 === 0;
        return (
          <li
            key={`${item.title}-${i}`}
            className="relative grid grid-cols-[2.5rem_1fr] gap-x-4 pb-5 last:pb-0 lg:grid-cols-[1fr_3.5rem_1fr] lg:gap-x-6 lg:pb-2 lg:[&:not(:first-child)]:-mt-10"
          >
            <div className="col-start-1 row-start-1 flex justify-center pt-4 lg:col-start-2">
              <span className="relative z-10 inline-flex size-10 items-center justify-center rounded-full border border-border bg-white text-primary shadow-sm">
                <DynamicIcon name={item.icon} fallback="clock" className="size-[18px]" strokeWidth={1.75} />
              </span>
            </div>
            <div
              className={cn(
                "col-start-2 row-start-1 rounded-2xl border border-border/70 bg-card px-5 py-4",
                first ? "lg:col-start-1" : "lg:col-start-3",
              )}
            >
              {item.time ? <p className="eyebrow mb-1">{item.time}</p> : null}
              <h3 className="font-bold text-foreground">{item.title}</h3>
              {item.description ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
