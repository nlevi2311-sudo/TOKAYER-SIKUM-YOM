"use client";

import { useId, useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ActionResult } from "@/types";
import { AdminSwitch } from "./admin-switch";

/**
 * מתג שמתעדכן מיד בממשק, שומר ברקע, וחוזר למצב הקודם אם השמירה נכשלה.
 */
export function OptimisticSwitch({
  checked,
  label,
  ariaLabel,
  onToggle,
  disabled,
  successMessage,
}: {
  checked: boolean;
  label: string;
  ariaLabel?: string;
  onToggle: (value: boolean) => Promise<ActionResult<unknown>>;
  disabled?: boolean;
  successMessage?: (value: boolean) => string;
}) {
  const id = useId();
  const router = useRouter();
  const [optimistic, setOptimistic] = useOptimistic(checked);
  const [pending, startTransition] = useTransition();

  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground select-none has-disabled:cursor-not-allowed"
    >
      <AdminSwitch
        id={id}
        size="sm"
        checked={optimistic}
        disabled={disabled || pending}
        aria-label={ariaLabel ?? label}
        onCheckedChange={(value) =>
          startTransition(async () => {
            setOptimistic(value);
            try {
              const result = await onToggle(value);
              if (!result.ok) {
                toast.error(result.error);
                return;
              }
              toast.success(successMessage?.(value) ?? result.message ?? "עודכן", { duration: 1800 });
              router.refresh();
            } catch {
              toast.error("משהו השתבש. נסו שוב.");
            }
          })
        }
      />
      <span aria-hidden="true">{label}</span>
    </label>
  );
}
