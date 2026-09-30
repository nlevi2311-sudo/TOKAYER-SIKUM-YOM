import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { getPublicContent } from "@/lib/data/public-content";
import { ButtonLink } from "@/components/public/buttons";
import { ContactDetails } from "@/components/public/contact-details";
import { PageHero } from "@/components/public/page-hero";
import { Container } from "@/components/public/section";
import { publicMetadata } from "@/components/public/seo";
import { WhatsappButton } from "@/components/public/whatsapp-button";
import { PathMotif } from "@/components/brand/path-motif";

export const revalidate = 300;

const INTRO = "לשאלות על טוקאייר, על תהליך הפנייה או על עבודה אצלנו. נשמח לעזור.";

export async function generateMetadata(): Promise<Metadata> {
  return publicMetadata({ title: "צור קשר", description: INTRO, path: "/contact" });
}

export default async function ContactPage() {
  const { contact } = await getPublicContent();
  const hasMap = Boolean(contact.mapsEmbedUrl);

  return (
    <>
      <PageHero eyebrow="צור קשר" title="נשמח לשמוע מכם" intro={INTRO} />
      <section aria-labelledby="details-title" className="py-16 sm:py-24">
        <Container className="grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:gap-12">
          <div className="h-fit rounded-3xl border border-border/70 bg-card p-6 sm:p-8">
            <h2 id="details-title" className="text-2xl font-extrabold text-primary">
              {contact.phone || contact.email || contact.address ? "פרטי קשר" : "פרטי הקשר יתעדכנו בקרוב"}
            </h2>
            <ContactDetails contact={contact} className="mt-6" />
            <div className="mt-8 flex flex-wrap gap-3 empty:hidden">
              <WhatsappButton number={contact.whatsapp} />
              {!hasMap && contact.mapsUrl ? (
                <ButtonLink href={contact.mapsUrl} external variant="outline">
                  <ExternalLink />
                  פתיחה ב Google Maps
                </ButtonLink>
              ) : null}
            </div>
          </div>

          {hasMap ? (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-3xl border border-border/70 bg-surface">
                <iframe
                  src={contact.mapsEmbedUrl}
                  title="מפת ההגעה לטוקאייר"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="block aspect-[4/3] w-full border-0"
                  allowFullScreen
                />
              </div>
              {contact.mapsUrl ? (
                <a
                  href={contact.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded text-sm font-semibold text-primary hover:underline"
                >
                  <ExternalLink className="size-4" aria-hidden="true" />
                  פתיחה ב Google Maps
                </a>
              ) : null}
            </div>
          ) : (
            <div
              aria-hidden="true"
              className="relative hidden min-h-72 overflow-hidden rounded-3xl bg-brand-gradient lg:block"
            >
              <PathMotif tone="light" className="absolute -end-24 -bottom-24 size-[30rem]" />
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
