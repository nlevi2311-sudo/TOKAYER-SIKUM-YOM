import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { siteConfig } from "@/config/site";
import type { PublicContent } from "@/config/public-content";
import { ContactDetails } from "./contact-details";
import { publicNav, staffEntry } from "./nav";
import { Container } from "./section";
import { SocialLinks } from "./social-links";

export function SiteFooter({ content }: { content: Pick<PublicContent, "contact" | "social"> }) {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-primary text-white">
      <Container className="grid gap-10 py-14 sm:py-16 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1.2fr]">
        <div className="space-y-5">
          <Logo tone="white" height={36} />
          <p className="max-w-sm leading-7 text-white/85">{siteConfig.description}</p>
          <SocialLinks social={content.social} className="text-white" />
        </div>

        <nav aria-label="ניווט בתחתית העמוד">
          <h2 className="text-sm font-bold text-white/75">באתר</h2>
          <ul role="list" className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 md:grid-cols-1">
            {[{ href: "/", label: "דף הבית" }, ...publicNav, staffEntry].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="rounded text-white/90 hover:text-white hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-bold text-white/75">פרטי קשר</h2>
          <ContactDetails contact={content.contact} tone="onDark" className="mt-4" />
        </div>
      </Container>
      <div className="border-t border-white/15">
        <Container className="py-5 text-sm text-white/75">
          <p>
            © {year} {siteConfig.name}, {siteConfig.organization}
          </p>
        </Container>
      </div>
    </footer>
  );
}
