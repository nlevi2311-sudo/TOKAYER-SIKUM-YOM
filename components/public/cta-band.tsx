import type { ReactNode } from "react";
import { PathMotif } from "@/components/brand/path-motif";
import { Container } from "./section";

/** פס קריאה לפעולה: רקע טורקיז מדורג ומוטיב המסלול בשוליים */
export function CtaBand({
  eyebrow,
  title,
  text,
  actions,
  id,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  actions?: ReactNode;
  id?: string;
}) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section id={id} aria-labelledby={headingId} className="scroll-mt-20 py-12 sm:py-16">
      <Container>
        <div className="bg-brand-gradient relative isolate overflow-hidden rounded-3xl px-6 py-12 text-white sm:px-12 sm:py-16">
          <PathMotif
            tone="light"
            className="absolute -end-40 -top-32 -z-10 size-[26rem] opacity-80 sm:-end-24 sm:size-[34rem]"
          />
          <div className="max-w-2xl space-y-4">
            {eyebrow ? <p className="text-sm font-bold text-white/85">{eyebrow}</p> : null}
            <h2 id={headingId} className="text-3xl font-extrabold leading-tight sm:text-4xl">
              {title}
            </h2>
            {text ? <p className="text-lg leading-8 text-white/90">{text}</p> : null}
          </div>
          {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}
        </div>
      </Container>
    </section>
  );
}
