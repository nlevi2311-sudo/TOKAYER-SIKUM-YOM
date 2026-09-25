"use client";

import { useRef, type FormEventHandler, type ReactNode } from "react";
import { Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * חלון עריכה אחיד לכל הישויות.
 * בטלפון החלון תופס כמעט את כל המסך, הגוף נגלל והכפתורים נשארים גלויים למטה.
 */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  submitting,
  submitLabel = "שמירה",
  size = "md",
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  submitting: boolean;
  submitLabel?: string;
  size?: "md" | "lg";
  children: ReactNode;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (submitting && !next) return;
        onOpenChange(next);
      }}
    >
      <DialogContent
        showCloseButton={false}
        className={cn(
          "flex max-h-[calc(100dvh-1rem)] flex-col gap-0 overflow-hidden rounded-2xl p-0",
          size === "lg" ? "sm:max-w-3xl" : "sm:max-w-2xl",
        )}
        onOpenAutoFocus={(e) => {
          const first = bodyRef.current?.querySelector<HTMLElement>(
            "input:not([type=hidden]):not([disabled]), textarea:not([disabled]), button[role=combobox]:not([disabled])",
          );
          if (first) {
            e.preventDefault();
            first.focus();
          }
        }}
      >
        <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-6">
            <div className="space-y-1 text-start">
              <DialogTitle className="text-lg font-bold text-primary">{title}</DialogTitle>
              {description ? (
                <DialogDescription>{description}</DialogDescription>
              ) : (
                <DialogDescription className="sr-only">טופס עריכה</DialogDescription>
              )}
            </div>
            <DialogClose asChild>
              <Button type="button" variant="ghost" size="icon-sm" aria-label="סגירת החלון" disabled={submitting}>
                <X />
              </Button>
            </DialogClose>
          </div>

          <div ref={bodyRef} className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
            {children}
          </div>

          <div className="flex items-center gap-2 border-t bg-surface/70 px-5 py-3 sm:px-6">
            <Button type="submit" disabled={submitting} className="min-w-28">
              {submitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              {submitting ? "שומר" : submitLabel}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={submitting}>
                ביטול
              </Button>
            </DialogClose>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** שתי עמודות בדסקטופ, עמודה אחת בטלפון */
export function FieldGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid gap-4 sm:grid-cols-2", className)}>{children}</div>;
}
