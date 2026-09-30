import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

/** כותרת אזור: כותרת עליונה בכתום וכותרת טורקיז גדולה, לפי ספר המותג */
export function SectionHeading({
  id,
  eyebrow,
  title,
  intro,
  align = "start",
  as: Tag = "h2",
  className,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "start" | "center";
  as?: "h1" | "h2";
  className?: string;
}) {
  if (!title && !intro) return null;
  return (
    <div className={cn("max-w-2xl space-y-3", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      {title ? (
        <Tag
          id={id}
          className={cn(
            "font-extrabold text-primary",
            Tag === "h1" ? "text-4xl leading-tight sm:text-5xl" : "text-3xl leading-tight sm:text-4xl",
          )}
        >
          {title}
        </Tag>
      ) : null}
      {intro ? <p className="text-lg leading-8 text-muted-foreground">{intro}</p> : null}
    </div>
  );
}

/** עטיפת אזור בעמוד: ריווח נדיב, רקע לבן או משטח בהיר */
export function Section({
  id,
  eyebrow,
  title,
  intro,
  tone = "white",
  align = "start",
  className,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  intro?: string;
  tone?: "white" | "surface";
  align?: "start" | "center";
  className?: string;
  children?: ReactNode;
}) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={title && headingId ? headingId : undefined}
      className={cn("relative scroll-mt-20 py-16 sm:py-24", tone === "surface" && "bg-surface", className)}
    >
      <Container>
        {title ? <SectionHeading id={headingId} eyebrow={eyebrow} title={title} intro={intro} align={align} /> : null}
        {children ? <div className={cn(title && "mt-10 sm:mt-12")}>{children}</div> : null}
      </Container>
    </section>
  );
}
