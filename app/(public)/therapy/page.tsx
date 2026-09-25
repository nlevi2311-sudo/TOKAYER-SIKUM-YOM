import type { Metadata } from "next";
import { getPublicContent } from "@/lib/data/public-content";
import { CardGrid } from "@/components/public/card-grid";
import { ContactCta } from "@/components/public/contact-cta";
import { PageHero } from "@/components/public/page-hero";
import { Paragraphs } from "@/components/public/paragraphs";
import { Container, Section } from "@/components/public/section";
import { publicMetadata } from "@/components/public/seo";
import { IconBadge } from "@/components/shared/icon-badge";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { therapy } = await getPublicContent();
  return publicMetadata({ title: therapy.title, description: therapy.intro, path: "/therapy" });
}

export default async function TherapyPage() {
  const { therapy } = await getPublicContent();
  return (
    <>
      <PageHero eyebrow="טיפול" title={therapy.title} intro={therapy.intro} />

      <section aria-label="התפיסה שלנו" className="py-16 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <Paragraphs text={therapy.body} />
          {therapy.principles.length > 0 ? (
            <aside aria-labelledby="principles-title" className="h-fit rounded-3xl bg-surface p-6 sm:p-8">
              <h2 id="principles-title" className="text-xl font-extrabold text-primary">
                העקרונות שמנחים אותנו
              </h2>
              <ul role="list" className="mt-6 space-y-6">
                {therapy.principles.map((p, i) => (
                  <li key={`${p.title}-${i}`} className="flex gap-4">
                    <IconBadge name={p.icon} fallback="sparkles" />
                    <div>
                      <h3 className="font-bold text-foreground">{p.title}</h3>
                      {p.description ? <p className="mt-1 leading-7 text-muted-foreground">{p.description}</p> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
        </Container>
      </section>

      {therapy.moments.length > 0 ? (
        <Section id="moments" tone="surface" eyebrow="ביומיום" title={therapy.momentsTitle}>
          <CardGrid items={therapy.moments} columns={3} />
        </Section>
      ) : null}

      <ContactCta />
    </>
  );
}
