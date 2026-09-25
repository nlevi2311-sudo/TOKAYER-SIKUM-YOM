"use client";

import { useOptimistic, useTransition } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { toggleFavorite } from "@/lib/actions/personal";
import { cn } from "@/lib/utils";

/** כפתור כוכב למועדפים. מתעדכן מיד ומתקן את עצמו אם השמירה נכשלה */
export function FavoriteButton({
  kind,
  id,
  title,
  initial,
  className,
}: {
  kind: "resource" | "training";
  id: string;
  title: string;
  initial: boolean;
  className?: string;
}) {
  const [optimistic, setOptimistic] = useOptimistic(initial);
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      setOptimistic(!optimistic);
      const result = await toggleFavorite({ kind, id });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.data?.favorite ? "נוסף למועדפים" : "הוסר מהמועדפים", { duration: 1800 });
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={optimistic}
      aria-label={optimistic ? `הסרת ${title} מהמועדפים` : `הוספת ${title} למועדפים`}
      title={optimistic ? "הסרה מהמועדפים" : "הוספה למועדפים"}
      className={cn(
        "relative z-10 inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-highlight/15 hover:text-highlight focus-visible:outline-2",
        optimistic && "text-highlight",
        className,
      )}
    >
      <Star className={cn("size-5 transition", optimistic && "fill-current")} strokeWidth={1.75} />
    </button>
  );
}
