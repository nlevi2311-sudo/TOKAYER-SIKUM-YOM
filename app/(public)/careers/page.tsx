import type { Metadata } from "next";
import { getPublicContent } from "@/lib/data/public-content";
import { CardGrid } from "@/components/public/card-grid";
import { CtaBand } from "@/components/public/cta-band";
import { CvButton } from "@/components/public/cv-button";
import { PageHero } from "@/components/public/page-hero";
import { Section } from "@/components/public/section";
import { publicMetadata } from "@/components/public/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { careers } = await getPublicContent();
  return publicMetadata({ title: careers.title, description: careers.intro, path: "/careers" });
}

export default async function CareersPage() {
  const { careers } = await getPublicContent();
  return (
    <>
      <PageHero
        eyebrow="הצטרפות לצוות"
        title={careers.title}
        intro={careers.intro}
        actions={<CvButton careers={careers} variant="primary" />}
      />

      {careers.roles.length > 0 ? (
        <Section id="roles" eyebrow="תפקידים" title="את מי אנחנו מחפשים">
          <CardGrid items={careers.roles} columns={3} />
        </Section>
      ) : null}

      {careers.why.length > 0 ? (
        <Section id="why" tone="surface" eyebrow="העבודה אצלנו" title={careers.whyTitle}>
          <CardGrid items={careers.why} columns={3} />
        </Section>
      ) : null}

      <CtaBand
        id="apply"
        title="רוצים להצטרף?"
        text="שלחו קורות חיים ונחזור אליכם."
        actions={<CvButton careers={careers} variant="highlight" />}
      />
    </>
  );
}
