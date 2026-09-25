"use client";

import { useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, type DefaultValues, type FieldValues, type Path, type UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import type { ActionResult } from "@/types";

type AnyResult = ActionResult<unknown>;

/** ממפה שגיאות שדה מהשרת (למשל "items.2.title") לשדות בטופס */
export function applyFieldErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  fieldErrors: Record<string, string[] | undefined> | undefined,
): boolean {
  if (!fieldErrors) return false;
  let first = true;
  let applied = false;
  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (key === "_" || !messages?.length) continue;
    setError(key as Path<T>, { type: "server", message: messages[0] }, { shouldFocus: first });
    first = false;
    applied = true;
  }
  return applied;
}

/** מציג הודעה לפי תוצאת הפעולה ומרענן את הנתונים אם הצליחה */
export function useResultHandler() {
  const router = useRouter();
  return useCallback(
    (result: AnyResult, successFallback = "נשמר"): boolean => {
      if (!result.ok) {
        toast.error(result.error);
        return false;
      }
      toast.success(result.message ?? successFallback);
      router.refresh();
      return true;
    },
    [router],
  );
}

/** הרצת פעולת שרת פשוטה (מחיקה, סידור, מתג) עם הודעה ורענון */
export function useRunAction() {
  const handle = useResultHandler();
  const [pending, startTransition] = useTransition();
  const run = useCallback(
    (action: () => Promise<AnyResult>, successFallback?: string) =>
      new Promise<boolean>((resolve) => {
        startTransition(async () => {
          try {
            resolve(handle(await action(), successFallback));
          } catch {
            toast.error("משהו השתבש. נסו שוב.");
            resolve(false);
          }
        });
      }),
    [handle],
  );
  return { run, pending };
}

/**
 * טופס עריכה שמחובר ל-server action:
 * אימות Zod בדפדפן, שליחה, הודעה, שגיאות שדה מהשרת ורענון.
 */
export function useActionForm<T extends FieldValues>({
  schema,
  defaultValues,
  action,
  transform,
  onSuccess,
  resetOnSuccess,
}: {
  schema: z.ZodType<T, T>;
  defaultValues: DefaultValues<T>;
  action: (values: T) => Promise<AnyResult>;
  transform?: (values: T) => T;
  onSuccess?: () => void;
  /** טופס שנשאר פתוח (למשל הוספה ברשימה): חוזר לערכים ההתחלתיים אחרי שמירה */
  resetOnSuccess?: boolean;
}) {
  const handle = useResultHandler();
  const form = useForm<T, unknown, T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onTouched",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    let result: AnyResult;
    try {
      result = await action(transform ? transform(values) : values);
    } catch {
      toast.error("משהו השתבש. נסו שוב.");
      return;
    }
    if (!result.ok) applyFieldErrors(form.setError, result.fieldErrors);
    if (handle(result)) {
      if (resetOnSuccess) form.reset(defaultValues);
      onSuccess?.();
    }
  });

  return { form, onSubmit, submitting: form.formState.isSubmitting };
}
