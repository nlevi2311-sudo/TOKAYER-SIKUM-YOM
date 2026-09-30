"use client";

import { useEffect, useState } from "react";
import { Clock, FileText, Link2, Plus, Presentation, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { AdminList, AdminListItem } from "@/components/admin/admin-list";
import { DataToolbar } from "@/components/admin/data-toolbar";
import { FieldGrid, FormDialog } from "@/components/admin/form-dialog";
import { FormSection, RolesField, SelectField, SwitchField, TextField } from "@/components/admin/form-fields";
import { RowActions } from "@/components/admin/row-actions";
import { RoleBadges, StatusBadge } from "@/components/admin/status-badge";
import { useActionForm } from "@/components/admin/use-action";
import { saveTraining } from "@/lib/actions/admin";
import { matchesQuery } from "@/lib/text";
import { trainingSchema } from "@/lib/validations/admin";
import type { Category, TrainingItem, TrainingRow } from "@/types";

const LINK_FIELDS = [
  { name: "link_url", label: "קישור ראשי", icon: Link2 },
  { name: "slides_url", label: "מצגת", icon: Presentation },
  { name: "video_url", label: "סרטון", icon: Video },
  { name: "file_url", label: "קובץ", icon: FileText },
] as const;

function TrainingForm({
  item,
  categories,
  onClose,
}: {
  item: TrainingRow | null;
  categories: Category[];
  onClose: () => void;
}) {
  const { form, onSubmit, submitting } = useActionForm({
    schema: trainingSchema,
    defaultValues: {
      id: item?.id,
      title: item?.title ?? "",
      summary: item?.summary ?? "",
      category_id: item?.category_id ?? "",
      file_url: item?.file_url ?? "",
      slides_url: item?.slides_url ?? "",
      video_url: item?.video_url ?? "",
      link_url: item?.link_url ?? "",
      duration_minutes: item?.duration_minutes ? String(item.duration_minutes) : "",
      is_mandatory: item?.is_mandatory ?? false,
      roles: item?.roles ?? [],
      keywords: (item?.keywords ?? []).join(", "),
    },
    action: saveTraining,
    onSuccess: onClose,
  });
  const { control } = form;

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={item ? "עריכת הדרכה" : "הדרכה חדשה"}
      description={item?.title}
      onSubmit={onSubmit}
      submitting={submitting}
      size="lg"
    >
      <FormSection title="פרטים">
        <TextField control={control} name="title" label="שם ההדרכה" required />
        <TextField control={control} name="summary" label="תקציר" multiline rows={3} help="במה עוסקת ההדרכה ולמי היא מיועדת" />
        <FieldGrid>
          <SelectField
            control={control}
            name="category_id"
            label="קטגוריה"
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            emptyLabel="ללא קטגוריה"
          />
          <TextField control={control} name="duration_minutes" label="משך בדקות" inputMode="numeric" ltr placeholder="45" />
        </FieldGrid>
        <SwitchField control={control} name="is_mandatory" label="הדרכת חובה" help="מסומנת כחובה ומופיעה במסלול הקליטה" />
      </FormSection>

      <FormSection title="חומרים" description="לפחות קישור אחד. הקישור הראשי נפתח כשלוחצים על ההדרכה.">
        <FieldGrid>
          {LINK_FIELDS.map((f) => (
            <TextField
              key={f.name}
              control={control}
              name={f.name}
              label={f.label}
              ltr
              type="url"
              inputMode="url"
              placeholder="https://"
            />
          ))}
        </FieldGrid>
      </FormSection>

      <FormSection title="חיפוש והרשאות">
        <TextField
          control={control}
          name="keywords"
          label="מילים לחיפוש"
          help="מילים נרדפות, מופרדות בפסיקים. עוזרות לצוות למצוא את ההדרכה בחיפוש."
        />
        <RolesField control={control} name="roles" />
      </FormSection>
    </FormDialog>
  );
}

export function TrainingManager({
  items,
  categories,
  openNew,
}: {
  items: TrainingItem[];
  categories: Category[];
  openNew: boolean;
}) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<{ item: TrainingRow | null } | null>(() => (openNew ? { item: null } : null));

  useEffect(() => {
    if (!openNew) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("new");
    window.history.replaceState(window.history.state, "", url.toString());
  }, [openNew]);

  const searching = query.trim() !== "";
  const visible = items.filter((t) => matchesQuery(query, t.title, t.summary, t.category?.name, t.keywords));

  return (
    <div className="space-y-4">
      <DataToolbar query={query} onQueryChange={setQuery} placeholder="חיפוש הדרכה" count={visible.length}>
        <Button onClick={() => setEditing({ item: null })}>
          <Plus aria-hidden="true" />
          הדרכה חדשה
        </Button>
      </DataToolbar>

      {visible.length === 0 ? (
        <EmptyState
          icon="graduation-cap"
          title={searching ? "לא נמצאו הדרכות" : "אין עדיין הדרכות"}
          description={searching ? undefined : "הדרכות, מצגות וסרטונים לצוות."}
        />
      ) : (
        <AdminList label="רשימת הדרכות">
          {visible.map((t, i) => {
            const links = LINK_FIELDS.filter((f) => t[f.name]);
            return (
              <AdminListItem
                key={t.id}
                icon={t.is_mandatory ? "clipboard-check" : "graduation-cap"}
                iconTone={t.is_mandatory ? "warm" : "teal"}
                title={t.title}
                titleExtra={t.is_mandatory ? <StatusBadge tone="warm">חובה</StatusBadge> : null}
                subtitle={t.summary}
                meta={
                  <>
                    <StatusBadge tone="outline">{t.category?.name ?? "ללא קטגוריה"}</StatusBadge>
                    <RoleBadges roles={t.roles} />
                    {t.duration_minutes ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5" aria-hidden="true" />
                        {t.duration_minutes} דק׳
                      </span>
                    ) : null}
                    {links.map((f) => (
                      <span key={f.name} className="inline-flex items-center gap-1">
                        <f.icon className="size-3.5" aria-hidden="true" />
                        {f.label}
                      </span>
                    ))}
                    {links.length === 0 ? <StatusBadge tone="warning">אין קישור</StatusBadge> : null}
                  </>
                }
                actions={
                  <RowActions
                    label={t.title}
                    id={t.id}
                    onEdit={() => setEditing({ item: t })}
                    deleteTable="training_items"
                    deleteDescription="ההדרכה תוסר מאזור הצוות, מהמועדפים וממסלול הקליטה."
                    move={searching ? undefined : { table: "training_items", canUp: i > 0, canDown: i < visible.length - 1 }}
                  />
                }
              />
            );
          })}
        </AdminList>
      )}

      {editing ? (
        <TrainingForm
          key={editing.item?.id ?? "new"}
          item={editing.item}
          categories={categories}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </div>
  );
}
