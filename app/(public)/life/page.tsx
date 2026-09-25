import type { Metadata } from "next";
import { getPublicContent } from "@/lib/data/public-content";
import { ContactCta } from "@/components/public/contact-cta";
import { Gallery } from "@/components/public/gallery";
import { PageHero } from "@/components/public/page-hero";
import { Section } from "@/components/public/section";
import { publicMetadata } from "@/components/public/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { life } = await getPublicContent();
  return publicMetadata({ title: life.title, description: life.intro, path: "/life" });
}

export default async function LifePage() {
  const { life } = await getPublicContent();
  return (
    <>
      <PageHero eyebrow="חיי הכפר" title={life.title} intro={life.intro} />
      <Section id="gallery" className="sm:py-20">
        <Gallery categories={life.categories} images={life.images} />
      </Section>
      <ContactCta />
    </>
  );
}
