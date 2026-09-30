import type { Metadata } from "next";
import { getPublicContent } from "@/lib/data/public-content";
import { CardGrid } from "@/components/public/card-grid";
import { ContactCta } from "@/components/public/contact-cta";
import { PageHero } from "@/components/public/page-hero";
import { Paragraphs } from "@/components/public/paragraphs";
import { Container } from "@/components/public/section";
import { publicMetadata } from "@/components/public/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { education } = await getPublicContent();
  return publicMetadata({ title: education.title, description: education.intro, path: "/education" });
}

export default async function EducationPage() {
  const { education } = await getPublicContent();
  return (
    <>
      <PageHero eyebrow="חינוך" title={education.title} intro={education.intro} />
      <section aria-label="למידה בטוקאייר" className="py-16 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <Paragraphs text={education.body} />
          <CardGrid items={education.points} columns={2} cardClassName="p-5 sm:p-6" />
        </Container>
      </section>
      <ContactCta />
    </>
  );
}
