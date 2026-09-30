import { LogIn } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "./buttons";
import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";
import { Container } from "./section";
import { staffEntry } from "./nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <Container className="flex h-16 items-center justify-between gap-4 lg:h-[72px]">
        <Logo height={34} priority className="max-w-[170px] sm:max-w-none" />
        <DesktopNav />
        <div className="flex items-center gap-2">
          <ButtonLink href={staffEntry.href} variant="outline" className="hidden min-h-10 px-4 text-sm sm:inline-flex">
            <LogIn />
            {staffEntry.label}
          </ButtonLink>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
