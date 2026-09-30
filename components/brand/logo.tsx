import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type LogoProps = {
  /** full: טוקאייר | קבוצת גיא. mark: הסמל בלבד */
  variant?: "full" | "mark";
  /** white: לשימוש על רקע טורקיז */
  tone?: "color" | "white";
  /** גובה בפיקסלים */
  height?: number;
  href?: string | null;
  className?: string;
  priority?: boolean;
};

/**
 * הלוגו נטען מהקבצים ב-public (ראו config/site.ts).
 * לפי ספר המותג: לוגו אמיתי, קטן ומכובד, בלי צל או אפקטים.
 */
export function Logo({ variant = "full", tone = "color", height = 36, href = "/", className, priority }: LogoProps) {
  const { logo } = siteConfig;
  const isMark = variant === "mark";
  const ratio = isMark ? logo.markWidth / logo.markHeight : logo.width / logo.height;
  const src = isMark ? logo.mark : tone === "white" ? logo.white : logo.src;

  const img = (
    <Image
      src={src}
      alt={logo.alt}
      width={Math.round(height * ratio)}
      height={height}
      priority={priority}
      className={cn("h-auto select-none", className)}
      style={{ height, width: "auto" }}
    />
  );

  if (!href) return img;
  return (
    <Link href={href} className="inline-flex shrink-0 items-center rounded-md" aria-label={`${siteConfig.name}: לעמוד הבית`}>
      {img}
    </Link>
  );
}
