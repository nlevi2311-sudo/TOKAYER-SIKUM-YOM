"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import type { PublicContent } from "@/config/public-content";
import { isExternalUrl } from "@/lib/text";
import { cn } from "@/lib/utils";

type GalleryImage = PublicContent["life"]["images"][number];

const ALL = "הכול";
const PLACEHOLDER_TILES = 6;

/** גלריית החיים בכפר עם סינון לפי קטגוריה */
export function Gallery({ categories, images }: { categories: string[]; images: GalleryImage[] }) {
  const [active, setActive] = useState<string>(ALL);
  const withSrc = useMemo(() => images.filter((img) => img.src), [images]);
  const chips = [ALL, ...categories.filter(Boolean)];
  const visible = active === ALL ? withSrc : withSrc.filter((img) => img.category === active);

  return (
    <div className="space-y-8">
      {chips.length > 1 ? (
        <div role="group" aria-label="סינון לפי נושא" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0">
          {chips.map((chip) => {
            const selected = chip === active;
            return (
              <button
                key={chip}
                type="button"
                onClick={() => setActive(chip)}
                aria-pressed={selected}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-white text-foreground/80 hover:border-primary/40 hover:text-primary",
                )}
              >
                {chip}
              </button>
            );
          })}
        </div>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {visible.length > 0 ? `מוצגות ${visible.length} תמונות` : "תמונות יתווספו בקרוב"}
      </p>

      {visible.length > 0 ? (
        <ul role="list" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {visible.map((img, i) => (
            <li key={`${img.src}-${i}`} className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-brand-soft">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(min-width: 1024px) 33vw, 50vw"
                unoptimized={isExternalUrl(img.src)}
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </li>
          ))}
        </ul>
      ) : (
        <ul role="list" aria-label="תמונות יתווספו בקרוב" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {Array.from({ length: PLACEHOLDER_TILES }, (_, i) => (
            <li
              key={i}
              className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/20 bg-surface p-4 text-center text-muted-foreground"
            >
              <ImageIcon className="size-7 text-primary/40" aria-hidden="true" strokeWidth={1.5} />
              <span className="text-sm">תמונות יתווספו בקרוב</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
