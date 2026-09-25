"use client";

import { useState } from "react";
import { Controller, get, useForm, useWatch, type FieldErrors } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TextField } from "@/components/admin/form-fields";
import { applyFieldErrors } from "@/components/admin/use-action";
import { cleanText, linesToText, textToLines } from "@/components/admin/utils";
import { resetPublicContent, savePublicContent } from "@/lib/actions/admin";
import {
  defaultPublicContent,
  publicContentSchemas,
  type ContentField,
  type ContentFieldType,
  type PublicContentKey,
} from "@/config/public-content";
import { RepeatableRows, type RowColumn, type RowItem } from "./repeatable-rows";

type FormValues = Record<string, string | RowItem[]>;

const LTR_TEXT_FIELDS = new Set(["email", "cvEmail", "phone", "whatsapp"]);

const ROW_SPECS: Record<
  Extract<ContentFieldType, "cards" | "timeline" | "gallery" | "members">,
  { itemLabel: string; titleKey: string; columns: RowColumn[]; empty: RowItem }
> = {
  cards: {
    itemLabel: "כרטיס",
    titleKey: "title",
    columns: [
      { key: "title", label: "כותרת", kind: "text" },
      { key: "icon", label: "אייקון", kind: "icon" },
      { key: "description", label: "תיאור", kind: "textarea" },
    ],
    empty: { title: "", description: "", icon: "" },
  },
  timeline: {
    itemLabel: "שלב",
    titleKey: "title",
    columns: [
      { key: "time", label: "זמן ביום", kind: "text", placeholder: "בוקר" },
      { key: "title", label: "כותרת", kind: "text" },
      { key: "icon", label: "אייקון", kind: "icon" },
      { key: "description", label: "תיאור", kind: "textarea" },
    ],
    empty: { time: "", title: "", description: "", icon: "" },
  },
  gallery: {
    itemLabel: "תמונה",
    titleKey: "alt",
    columns: [
      { key: "src", label: "כתובת התמונה", kind: "url", placeholder: "/images/life-1.jpg", wide: true },
      { key: "alt", label: "תיאור התמונה (לנגישות)", kind: "text" },
      { key: "category", label: "קטגוריה", kind: "select" },
    ],
    empty: { src: "", alt: "", category: "" },
  },
  members: {
    itemLabel: "איש צוות",
    titleKey: "name",
    columns: [
      { key: "name", label: "שם", kind: "text" },
      { key: "role", label: "תפקיד", kind: "text" },
      { key: "photo", label: "כתובת תמונה", kind: "url", placeholder: "/images/team/name.jpg", wide: true },
    ],
    empty: { name: "", role: "", photo: "" },
  },
};

function isRowType(type: ContentFieldType): type is keyof typeof ROW_SPECS {
  return type in ROW_SPECS;
}

/** ערך שמור -> ערכי טופס */
function toFormValues(fields: ContentField[], value: Record<string, unknown>): FormValues {
  const out: FormValues = {};
  for (const f of fields) {
    const v = value[f.name];
    if (f.type === "lines") out[f.name] = linesToText(Array.isArray(v) ? v.map(String) : []);
    else if (isRowType(f.type)) out[f.name] = Array.isArray(v) ? (v as RowItem[]).map((row) => ({ ...row })) : [];
    else out[f.name] = typeof v === "string" ? v : "";
  }
  return out;
}

/** ערכי טופס -> ערך לשמירה */
function fromFormValues(fields: ContentField[], values: FormValues): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const v = values[f.name];
    out[f.name] = f.type === "lines" ? textToLines(typeof v === "string" ? v : "") : v;
  }
  return out;
}

/** שגיאה בשורה של שדה "lines" (למשל images.2) מוצגת על השדה כולו */
function normalizeErrors(fields: ContentField[], fieldErrors: Record<string, string[] | undefined>) {
  const lineFields = new Set(fields.filter((f) => f.type === "lines").map((f) => f.name));
  const out: Record<string, string[] | undefined> = {};
  for (const [path, messages] of Object.entries(fieldErrors)) {
    const [root, index] = path.split(".");
    if (lineFields.has(root) && index !== undefined) {
      out[root] = [`שורה ${Number(index) + 1}: ${messages?.[0] ?? ""}`];
    } else {
      out[path] = messages;
    }
  }
  return out;
}

function issuesToFieldErrors(issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>) {
  const out: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".") || "_";
    (out[key] ??= []).push(cleanText(issue.message));
  }
  return out;
}

export function ContentForm({
  contentKey,
  fields,
  initialValue,
  hasStored,
}: {
  contentKey: PublicContentKey;
  fields: ContentField[];
  initialValue: Record<string, unknown>;
  hasStored: boolean;
}) {
  const router = useRouter();
  const [resetCount, setResetCount] = useState(0);
  const form = useForm<FormValues>({ defaultValues: toFormValues(fields, initialValue) });
  const { control, handleSubmit, setError, clearErrors, reset, formState } = form;

  // לגלריה: הקטגוריות נלקחות מהשדה "categories" של אותו אזור, כולל שינויים שעוד לא נשמרו
  const categoriesText = useWatch({ control, name: "categories" });
  const galleryCategories = typeof categoriesText === "string" ? textToLines(categoriesText) : [];

  const onSubmit = handleSubmit(async (values) => {
    clearErrors();
    const value = fromFormValues(fields, values);
    const parsed = publicContentSchemas[contentKey].safeParse(value);
    if (!parsed.success) {
      applyFieldErrors(setError, normalizeErrors(fields, issuesToFieldErrors(parsed.error.issues)));
      toast.error("יש שדות שצריך לתקן");
      return;
    }
    try {
      const result = await savePublicContent(contentKey, parsed.data);
      if (!result.ok) {
        toast.error(result.error);
        if (result.fieldErrors) applyFieldErrors(setError, normalizeErrors(fields, result.fieldErrors));
        return;
      }
      toast.success(result.message ?? "נשמר");
      reset(values);
      router.refresh();
    } catch {
      toast.error("משהו השתבש. נסו שוב.");
    }
  });

  async function onReset() {
    try {
      const result = await resetPublicContent(contentKey);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message ?? "התוכן חזר לברירת המחדל");
      reset(toFormValues(fields, defaultPublicContent[contentKey] as Record<string, unknown>));
      setResetCount((n) => n + 1);
      router.refresh();
    } catch {
      toast.error("משהו השתבש. נסו שוב.");
    }
  }

  const errorAt = (errors: FieldErrors<FormValues>, path: string): string | undefined => {
    const e: unknown = get(errors, path);
    return e && typeof e === "object" && "message" in e && typeof e.message === "string" ? e.message : undefined;
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="space-y-6 rounded-2xl border bg-card p-5 sm:p-6">
        {fields.map((f) => {
          const label = cleanText(f.label);
          const help = f.help ? cleanText(f.help) : undefined;

          if (isRowType(f.type)) {
            const spec = ROW_SPECS[f.type];
            const columns =
              f.type === "gallery"
                ? spec.columns.map((c) => (c.kind === "select" ? { ...c, options: galleryCategories } : c))
                : spec.columns;
            const rootError = errorAt(formState.errors, f.name);
            return (
              <fieldset key={f.name} className="space-y-3 border-t pt-5 first:border-t-0 first:pt-0">
                <legend className="sr-only">{label}</legend>
                <div aria-hidden="true">
                  <p className="text-sm font-bold">{label}</p>
                  {help ? <p className="text-xs text-muted-foreground">{help}</p> : null}
                </div>
                {rootError ? (
                  <p role="alert" className="text-xs font-medium text-destructive">
                    {rootError}
                  </p>
                ) : null}
                <Controller
                  control={control}
                  name={f.name}
                  render={({ field }) => (
                    <RepeatableRows
                      key={resetCount}
                      value={Array.isArray(field.value) ? field.value : []}
                      onChange={field.onChange}
                      columns={columns}
                      emptyItem={spec.empty}
                      itemLabel={spec.itemLabel}
                      titleKey={spec.titleKey}
                      errorFor={(index, key) => errorAt(formState.errors, `${f.name}.${index}.${key}`)}
                    />
                  )}
                />
              </fieldset>
            );
          }

          return (
            <TextField
              key={f.name}
              control={control}
              name={f.name}
              label={label}
              help={help}
              multiline={f.type === "textarea" || f.type === "lines"}
              rows={f.type === "lines" ? 4 : f.name === "body" ? 8 : 3}
              ltr={f.type === "url" || (f.type === "lines" && f.name === "images") || LTR_TEXT_FIELDS.has(f.name)}
              type={f.type === "url" ? "url" : "text"}
              placeholder={f.type === "url" ? "https://" : undefined}
            />
          );
        })}
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
        <div className="flex items-center gap-2">
          <Button type="submit" disabled={formState.isSubmitting} className="min-w-28">
            {formState.isSubmitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            {formState.isSubmitting ? "שומר" : "שמירה"}
          </Button>
          {formState.isDirty ? (
            <span className="text-xs text-warm" role="status">
              יש שינויים שלא נשמרו
            </span>
          ) : null}
        </div>
        <ConfirmDialog
          title="לשחזר את ברירת המחדל?"
          description={
            hasStored
              ? "כל מה שנערך באזור הזה יימחק, והאתר יציג שוב את הטקסטים המקוריים."
              : "האזור הזה כבר מציג את ברירת המחדל. שינויים שלא נשמרו יימחקו."
          }
          confirmLabel="שחזור"
          onConfirm={onReset}
          trigger={
            <Button type="button" variant="ghost" className="text-muted-foreground">
              <RotateCcw aria-hidden="true" />
              שחזור ברירת מחדל
            </Button>
          }
        />
      </div>
    </form>
  );
}
