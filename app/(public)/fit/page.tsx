import type { Metadata } from "next";
import { ArrowLeft, Info } from "lucide-react";
import { getPublicContent } from "@/lib/data/public-content";
import { ButtonLink } from "@/components/public/buttons";
import { CardGrid } from "@/components/public/card-grid";
import { PageHero } from "@/components/public/page-hero";
import { Paragraphs } from "@/components/public/paragraphs";
import { Container, Section } from "@/components/public/section";
import { publicMetadata } from "@/components/public/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { fit } = await getPublicContent();
  return publicMetadata({ title: fit.title, description: fit.intro, path: "/fit" });
}

export default async function FitPage() {
  const { fit } = await getPublicContent();
  return (
    <>
      <PageHero eyebrow="מידע למשפחות ולגורמים מפנים" title={fit.title} intro={fit.intro} />

      {fit.points.length > 0 ? (
        <Section id="points">
          <CardGrid items={fit.points} columns={3} />
        </Section>
      ) : null}

      <section aria-labelledby="process-title" className="bg-surface py-16 sm:py-24">
        <Container className="max-w-4xl space-y-8">
          <div className="space-y-3">
            <p className="eyebrow">תהליך הפנייה</p>
            <h2 id="process-title" className="text-3xl font-extrabold text-primary sm:text-4xl">
              איך בודקים התאמה
            </h2>
          </div>
          <Paragraphs text={fit.body} />
          {fit.note ? (
            <div className="flex flex-col gap-5 rounded-3xl border border-border/70 bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <p className="flex items-start gap-3 font-semibold text-foreground">
                <Info className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                {fit.note}
              </p>
              <ButtonLink href="/contact" className="shrink-0">
                ליצירת קשר
                <ArrowLeft />
              </ButtonLink>
            </div>
          ) : null}
        </Container>
      </section>
    </>
  );
}
