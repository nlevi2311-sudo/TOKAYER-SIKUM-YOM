"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { isExternalUrl } from "@/lib/text";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "./use-reduced-motion";

const INTERVAL_MS = 6000;

/**
 * מדיה של ה Hero: תמונות מתחלפות במעבר רך, או וידאו רקע אם הוגדר.
 * כשהמשתמש ביקש להפחית תנועה: תמונה אחת קבועה ובלי וידאו.
 */
export function HeroMedia({ images, video, className }: { images: string[]; video?: string; className?: string }) {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const canRotate = images.length > 1 && !reducedMotion && !video;
  const rotating = canRotate && !paused;

  useEffect(() => {
    if (!rotating) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") setIndex((i) => (i + 1) % images.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [rotating, images.length]);

  const showVideo = Boolean(video) && !reducedMotion;
  const current = canRotate ? index : 0;

  return (
    <div className={cn("relative overflow-hidden bg-brand-soft", className)}>
      {images.map((src, i) => (
        <Image
          key={`${src}-${i}`}
          src={src}
          alt=""
          fill
          priority={i === 0}
          sizes="(min-width: 1024px) 50vw, 100vw"
          unoptimized={isExternalUrl(src)}
          className={cn(
            "object-cover transition-opacity duration-[1400ms] ease-in-out",
            i === current ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
      {showVideo && video ? (
        <video
          className="absolute inset-0 size-full object-cover"
          src={video}
          poster={images[0]}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
      ) : null}
      {canRotate ? (
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "הפעלת החלפת התמונות" : "עצירת החלפת התמונות"}
          aria-pressed={paused}
          className="absolute bottom-4 end-4 inline-flex size-10 items-center justify-center rounded-full bg-white/85 text-primary shadow-sm backdrop-blur transition-colors hover:bg-white"
        >
          {paused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
        </button>
      ) : null}
    </div>
  );
}
