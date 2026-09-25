import { ArrowLeft } from "lucide-react";
import type { PublicContent } from "@/config/public-content";
import { ButtonLink } from "./buttons";
import { ContactDetails } from "./contact-details";
import { Container } from "./section";
import { WhatsappButton } from "./whatsapp-button";

/** פס יצירת קשר קצר בתחתית דף הבית */
export function ContactStrip({ contact }: { contact: PublicContent["contact"] }) {
  return (
    <section id="contact" aria-labelledby="contact-strip-title" className="scroll-mt-20 pb-20 pt-4 sm:pb-24">
      <Container>
        <div className="grid gap-8 rounded-3xl border border-border/70 bg-surface p-6 sm:p-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <div className="space-y-3">
            <p className="eyebrow">צור קשר</p>
            <h2 id="contact-strip-title" className="text-3xl font-extrabold text-primary">
              נשמח לדבר
            </h2>
            <p className="leading-7 text-muted-foreground">
              לשאלות על טוקאייר, על תהליך הפנייה או על עבודה אצלנו.
            </p>
            <div className="flex flex-wrap gap-3 pt-3">
              <ButtonLink href="/contact">
                לכל פרטי הקשר
                <ArrowLeft />
              </ButtonLink>
              <WhatsappButton number={contact.whatsapp} />
            </div>
          </div>
          <ContactDetails contact={contact} className="grid gap-4 space-y-0 sm:grid-cols-2" />
        </div>
      </Container>
    </section>
  );
}
