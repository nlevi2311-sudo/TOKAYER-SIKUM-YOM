import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { getPublicContent } from "@/lib/data/public-content";
import { ButtonLink } from "@/components/public/buttons";
import { CardGrid, LinkCardGrid, type LinkCard } from "@/components/public/card-grid";
import { ContactStrip } from "@/components/public/contact-strip";
import { CtaBand } from "@/components/public/cta-band";
import { DayTimeline } from "@/components/public/day-timeline";
import { Hero } from "@/components/public/hero";
import { Paragraphs } from "@/components/public/paragraphs";
import { Container, Section, SectionHeading } from "@/components/public/section";
import { publicMetadata } from "@/components/public/seo";
import { TeamGrid } from "@/components/public/team-grid";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { hero } = await getPublicContent();
  return publicMetadata({
    title: `${siteConfig.fullName} | ${siteConfig.organization}`,
    description: hero.description || siteConfig.description,
    path: "/",
    absoluteTitle: true,
  });
}

export default async function HomePage() {
  const content = await getPublicContent();
  const { hero, about, uniqueness, day, team, therapy, education, life, fit, careers, contact } = content;

  const teasers: LinkCard[] = [
    { href: "/therapy", title: therapy.title, description: therapy.intro, icon: "heart-handshake", cta: "לתפיסה הטיפולית" },
    { href: "/education", title: education.title, description: education.intro, icon: "book-open", cta: "לחינוך ולמידה" },
    { href: "/life", title: life.title, description: life.intro, icon: "trees", cta: "לחיים בכפר" },
    { href: "/fit", title: fit.title, description: fit.intro, icon: "compass", cta: "למי זה מתאים" },
  ];

  return (
    <>
      <Hero hero={hero} />

      <section id="about" aria-labelledby="about-title" className="relative scroll-mt-20 py-16 sm:py-24">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div className="space-y-8">
            <SectionHeading id="about-title" eyebrow="הסיפור שלנו" title={about.title} />
            {about.highlight ? (
              <blockquote className="relative border-s-4 border-highlight ps-6 text-2xl font-bold leading-snug text-primary sm:text-3xl sm:leading-snug">
                {about.highlight}
              </blockquote>
            ) : null}
          </div>
          <Paragraphs text={about.body} className="lg:pt-10" />
        </Container>
      </section>

      <Section id="uniqueness" tone="surface" eyebrow="הגישה שלנו" title={uniqueness.title} intro={uniqueness.intro}>
        <CardGrid items={uniqueness.items} columns={4} />
      </Section>

      <Section id="day" eyebrow="השגרה" title={day.title} intro={day.intro} align="center">
        <DayTimeline items={day.items} />
      </Section>

      <Section id="team" tone="surface" eyebrow="הצוות" title={team.title} intro={team.intro}>
        <TeamGrid team={team} />
      </Section>

      <Section id="explore" eyebrow="להכיר מקרוב" title="עוד על טוקאייר">
        <LinkCardGrid items={teasers} />
      </Section>

      <CtaBand
        id="careers"
        eyebrow="הצטרפות לצוות"
        title={careers.title}
        text={careers.intro}
        actions={
          <ButtonLink href="/careers" variant="highlight">
            לתפקידים הפתוחים
            <ArrowLeft />
          </ButtonLink>
        }
      />

      <ContactStrip contact={contact} />
    </>
  );
}
