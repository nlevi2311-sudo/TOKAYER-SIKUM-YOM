"use client";

import { useEffect, useMemo } from "react";
import { useWatch } from "react-hook-form";
import { ChevronDown } from "lucide-react";
import { FieldGrid, FormDialog } from "@/components/admin/form-dialog";
import {
  FormSection,
  IconField,
  RolesField,
  SelectField,
  SwitchField,
  TextField,
} from "@/components/admin/form-fields";
import { useActionForm } from "@/components/admin/use-action";
import { DOC_TYPE_OPTIONS, RESOURCE_TYPE_PLURALS, toDateInput } from "@/components/admin/utils";
import { saveResource } from "@/lib/actions/admin";
import { RESOURCE_TYPE_LABELS, RESOURCE_TYPES, SECTION_FOR_TYPE } from "@/lib/labels";
import { resourceSchema, type ResourceInput } from "@/lib/validations/admin";
import type { CategoryRow, ResourceRow, ResourceType } from "@/types";

export const RESOURCE_FLAGS = [
  { name: "is_quick_access", label: "גישה מהירה", help: "מופיע בגישה המהירה בדף הבית של הצוות" },
  { name: "is_pinned", label: "מוצמד", help: "מופיע בראש הרשימה באזור שלו" },
  { name: "is_important", label: "חשוב", help: "מסומן בולט ברשימות" },
  { name: "is_public", label: "גלוי בלי התחברות", help: "רק לחומר שמותר לשתף מחוץ לצוות" },
] as const;

function toFormValues(resource: ResourceRow | null, type: ResourceType): ResourceInput {
  return {
    id: resource?.id,
    title: resource?.title ?? "",
    description: resource?.description ?? "",
    url: resource?.url ?? "",
    type: resource?.type ?? type,
    category_id: resource?.category_id ?? "",
    icon: resource?.icon ?? "",
    roles: resource?.roles ?? [],
    is_public: resource?.is_public ?? false,
    is_pinned: resource?.is_pinned ?? false,
    is_important: resource?.is_important ?? false,
    is_quick_access: resource?.is_quick_access ?? false,
    owner: resource?.owner ?? "",
    doc_type: resource?.doc_type ?? "",
    keywords: (resource?.keywords ?? []).join(", "),
    content_updated_at: toDateInput(resource?.content_updated_at),
    drive_file_id: resource?.drive_file_id ?? "",
  };
}

export function ResourceForm({
  resource,
  defaultType,
  categories,
  onClose,
}: {
  resource: ResourceRow | null;
  defaultType: ResourceType;
  categories: CategoryRow[];
  onClose: () => void;
}) {
  const { form, onSubmit, submitting } = useActionForm({
    schema: resourceSchema,
    defaultValues: toFormValues(resource, defaultType),
    action: saveResource,
    onSuccess: onClose,
  });
  const { control, setValue, getValues } = form;
  const type = useWatch({ control, name: "type" });

  const categoryOptions = useMemo(
    () =>
      categories
        .filter((c) => c.section === SECTION_FOR_TYPE[type])
        .map((c) => ({ value: c.id, label: c.name })),
    [categories, type],
  );

  // קטגוריה שלא שייכת לסוג החדש מתאפסת
  useEffect(() => {
    const current = getValues("category_id");
    if (current && !categoryOptions.some((o) => o.value === current)) setValue("category_id", "");
  }, [categoryOptions, getValues, setValue]);

  const hasAdvanced = Boolean(resource?.drive_file_id);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={resource ? `עריכת ${RESOURCE_TYPE_LABELS[resource.type]}` : `${RESOURCE_TYPE_LABELS[defaultType]} חדש`}
      description={resource ? resource.title : "הפריט יופיע לצוות מיד אחרי השמירה."}
      onSubmit={onSubmit}
      submitting={submitting}
      size="lg"
    >
      <FormSection title="פרטים">
        <TextField control={control} name="title" label="שם" required />
        <TextField control={control} name="description" label="תיאור קצר" multiline rows={2} />
        <TextField
          control={control}
          name="url"
          label="כתובת"
          required
          ltr
          type="url"
          inputMode="url"
          placeholder="https://"
          help="קישור מלא, או כתובת פנימית שמתחילה ב /. אפשר גם קישור למייל או לטלפון."
        />
        <FieldGrid>
          <SelectField
            control={control}
            name="type"
            label="סוג"
            options={RESOURCE_TYPES.map((t) => ({ value: t, label: `${RESOURCE_TYPE_LABELS[t]} (${RESOURCE_TYPE_PLURALS[t]})` }))}
          />
          <SelectField
            control={control}
            name="category_id"
            label="קטגוריה"
            options={categoryOptions}
            emptyLabel="ללא קטגוריה"
            help={categoryOptions.length === 0 ? "אין עדיין קטגוריות לסוג הזה" : undefined}
          />
          <IconField control={control} name="icon" label="אייקון" />
          <SelectField control={control} name="doc_type" label="סוג קובץ" options={DOC_TYPE_OPTIONS} emptyLabel="לא צוין" />
          <TextField control={control} name="owner" label="אחראי" help="מי מעדכן את התוכן הזה" />
          <TextField control={control} name="content_updated_at" label="עודכן לאחרונה" type="date" help="תאריך העדכון של התוכן עצמו" />
        </FieldGrid>
        <TextField
          control={control}
          name="keywords"
          label="מילים לחיפוש"
          help="מילים נרדפות שעובדים עשויים לחפש, מופרדות בפסיקים. למשל בנוהל נעדרות: בריחה, נעדר, יציאה ללא רשות."
          placeholder="בריחה, נעדר, יציאה ללא רשות"
        />
      </FormSection>

      <FormSection title="הרשאות">
        <RolesField control={control} name="roles" />
      </FormSection>

      <FormSection title="תצוגה">
        <div className="grid gap-2 sm:grid-cols-2">
          {RESOURCE_FLAGS.map((f) => (
            <SwitchField key={f.name} control={control} name={f.name} label={f.label} help={f.help} />
          ))}
        </div>
      </FormSection>

      <details className="group rounded-xl border bg-surface/60" open={hasAdvanced}>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold [&::-webkit-details-marker]:hidden">
          הגדרות מתקדמות
          <ChevronDown className="size-4 transition group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="border-t px-3 py-3">
          <TextField
            control={control}
            name="drive_file_id"
            label="מזהה קובץ ב Google Drive"
            ltr
            help="לחיבור עתידי ל Google Drive API. אפשר להשאיר ריק."
          />
        </div>
      </details>
    </FormDialog>
  );
}
