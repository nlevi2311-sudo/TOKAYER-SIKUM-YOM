import { ArrowLeft } from "lucide-react";
import type { PublicContent } from "@/config/public-content";
import { PathMotif } from "@/components/brand/path-motif";
import { ButtonLink } from "./buttons";
import { HeroMedia } from "./hero-media";
import { Container } from "./section";

/** ה Hero של דף הבית: כותרת, כותרת משנה, פתיח וכפתורים, ולצדם תמונות מתחלפות או וידאו */
export function Hero({ hero }: { hero: PublicContent["hero"] }) {
  const [firstLine, ...restLines] = hero.title.split("\n").map((l) => l.trim()).filter(Boolean);
  const images = hero.images.filter(Boolean);

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-brand-soft">
      <PathMotif className="absolute -bottom-[22rem] -start-40 -z-10 hidden size-[36rem] opacity-60 lg:block" />
      <Container className="grid items-center gap-10 pb-14 pt-10 sm:pt-14 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:pb-24 lg:pt-20">
        <div className="animate-fade-up space-y-6">
          <h1 id="hero-title" className="font-extrabold leading-[1.05] text-primary">
            {firstLine ? <span className="block text-5xl sm:text-6xl lg:text-7xl">{firstLine}</span> : null}
            {restLines.map((line, i) => (
              <span key={i} className="mt-2 block text-3xl font-bold text-foreground sm:text-4xl lg:text-[2.75rem]">
                {line}
              </span>
            ))}
          </h1>
          {hero.subtitle ? <p className="text-xl font-semibold text-warm sm:text-2xl">{hero.subtitle}</p> : null}
          {hero.description ? (
            <p className="max-w-xl text-lg leading-8 text-muted-foreground">{hero.description}</p>
          ) : null}
          <div className="flex flex-wrap gap-3 pt-2">
            <ButtonLink href="/#about">
              להכיר את טוקאייר
              <ArrowLeft />
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline">
              צור קשר
            </ButtonLink>
          </div>
        </div>
        {images.length > 0 || hero.video ? (
          <HeroMedia
            images={images}
            video={hero.video || undefined}
            className="aspect-[4/3] rounded-[2rem] shadow-xl shadow-primary/10 lg:aspect-[5/5.2]"
          />
        ) : null}
      </Container>
    </section>
  );
}
