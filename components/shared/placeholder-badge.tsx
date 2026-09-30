import { isPlaceholderUrl } from "@/lib/text";
import { cn } from "@/lib/utils";

/** תגית קטנה לפריטים שעדיין מצביעים לכתובת זמנית */
export function PlaceholderBadge({ url, className }: { url: string | null | undefined; className?: string }) {
  if (!isPlaceholderUrl(url)) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-highlight/15 px-2 py-0.5 text-[11px] font-medium text-[#8a5a00]",
        className,
      )}
      title="הקישור עדיין לא עודכן בממשק הניהול"
    >
      קישור זמני
    </span>
  );
}
