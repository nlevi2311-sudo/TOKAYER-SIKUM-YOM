import { Send } from "lucide-react";
import type { PublicContent } from "@/config/public-content";
import { ButtonLink, type PublicButtonVariant } from "./buttons";

/** כפתור שליחת קורות חיים: טופס חיצוני אם הוגדר, אחרת מייל */
export function CvButton({
  careers,
  variant = "highlight",
  className,
}: {
  careers: Pick<PublicContent["careers"], "formUrl" | "cvEmail">;
  variant?: PublicButtonVariant;
  className?: string;
}) {
  if (careers.formUrl) {
    return (
      <ButtonLink href={careers.formUrl} external variant={variant} className={className}>
        <Send />
        שליחת קורות חיים
      </ButtonLink>
    );
  }
  if (careers.cvEmail) {
    const href = `mailto:${careers.cvEmail}?subject=${encodeURIComponent("קורות חיים")}`;
    return (
      <ButtonLink href={href} variant={variant} className={className}>
        <Send />
        שליחת קורות חיים
      </ButtonLink>
    );
  }
  return null;
}
