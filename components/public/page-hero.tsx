import type { ReactNode } from "react";
import { PathMotif } from "@/components/brand/path-motif";
import { Breadcrumbs } from "@/components/shared/page-header";
import { Container } from "./section";

/** פתיח לעמוד פנימי: פירורי לחם, כותרת עליונה, כותרת ראשית ופתיח */
export function PageHero({
  eyebrow,
  title,
  intro,
  actions,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  actions?: ReactNode;
}) {
  return (
    <section aria-labelledby="page-title" className="relative isolate overflow-hidden bg-brand-soft">
      <PathMotif className="absolute -end-44 -top-40 -z-10 size-[30rem] opacity-60 sm:-end-28 sm:size-[36rem]" />
      <Container className="pb-12 pt-8 sm:pb-16 sm:pt-10 lg:pb-20">
        <Breadcrumbs items={[{ label: "דף הבית", href: "/" }, { label: title }]} />
        <div className="animate-fade-up mt-8 max-w-3xl space-y-4 sm:mt-12">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h1 id="page-title" className="text-4xl font-extrabold leading-tight text-primary sm:text-5xl">
            {title}
          </h1>
          {intro ? <p className="text-lg leading-8 text-foreground/80 sm:text-xl sm:leading-9">{intro}</p> : null}
          {actions ? <div className="flex flex-wrap gap-3 pt-3">{actions}</div> : null}
        </div>
      </Container>
    </section>
  );
}
