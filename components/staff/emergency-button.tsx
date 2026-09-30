"use client";

import { LifeBuoy } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { EmergencyProtocol } from "@/types";
import { EmergencyPanel } from "./emergency-panel";

/** כפתור "חירום ונהלים מיידיים": קבוע בראש אזור הצוות. בולט, לא מלחיץ */
export function EmergencyButton({
  protocols,
  variant = "pill",
  className,
}: {
  protocols: EmergencyProtocol[];
  variant?: "pill" | "compact" | "card";
  className?: string;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {variant === "card" ? (
          <button
            type="button"
            className={cn(
              "group flex w-full items-center gap-4 rounded-2xl border border-emergency/20 bg-emergency-soft/60 p-4 text-start transition hover:border-emergency/40 hover:bg-emergency-soft",
              className,
            )}
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emergency text-white">
              <LifeBuoy className="size-6" aria-hidden="true" />
            </span>
            <span className="flex-1">
              <span className="block font-bold text-emergency">חירום ונהלים מיידיים</span>
              <span className="block text-sm text-muted-foreground">מה עושים עכשיו, למי מתקשרים ומה מדווחים</span>
            </span>
          </button>
        ) : (
          <button
            type="button"
            aria-label="חירום ונהלים מיידיים"
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full bg-emergency font-semibold text-white shadow-sm shadow-emergency/20 transition hover:brightness-110 focus-visible:outline-2",
              variant === "pill" ? "h-10 px-4 text-sm" : "h-9 px-3 text-xs",
              className,
            )}
          >
            <LifeBuoy className="size-4" aria-hidden="true" />
            <span>{variant === "pill" ? "חירום ונהלים מיידיים" : "חירום"}</span>
          </button>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="mx-auto max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-t-3xl p-5 pb-safe sm:p-7">
        <SheetHeader className="p-0 text-start">
          <SheetTitle className="text-2xl font-extrabold text-emergency">חירום ונהלים מיידיים</SheetTitle>
          <SheetDescription>הנחיות קצרות לרגע האמת. הנוסח המחייב נמצא בנוהל המלא.</SheetDescription>
        </SheetHeader>
        <div className="pb-4">
          <EmergencyPanel protocols={protocols} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
