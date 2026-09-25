"use client";

import { useState } from "react";
import { ExternalLink, GraduationCap, Library, Link2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminList, AdminListItem, ListGroup } from "@/components/admin/admin-list";
import { FormDialog } from "@/components/admin/form-dialog";
import { SelectField, TextField, type Option } from "@/components/admin/form-fields";
import { RowActions } from "@/components/admin/row-actions";
import { StatusBadge } from "@/components/admin/status-badge";
import { useActionForm } from "@/components/admin/use-action";
import { saveOnboardingItem } from "@/lib/actions/admin";
import { ONBOARDING_STAGE_LABELS, ONBOARDING_STAGES } from "@/lib/labels";
import { onboardingSchema } from "@/lib/validations/admin";
import { cn } from "@/lib/utils";
import type { OnboardingItem, OnboardingStage } from "@/types";

type LinkKind = "none" | "resource" | "training" | "url";

const LINK_KINDS: Array<{ value: LinkKind; label: string }> = [
  { value: "none", label: "בלי קישור" },
  { value: "resource", label: "משאב קיים" },
  { value: "training", label: "הדרכה" },
  { value: "url", label: "כתובת חופשית" },
];

export type OnboardingRow = OnboardingItem & { linkedTitle: string | null };

function linkKindOf(item: OnboardingItem | null): LinkKind {
  if (!item) return "none";
  if (item.resource_id) return "resource";
  if (item.training_id) return "training";
  if (item.url) return "url";
  return "none";
}

function OnboardingForm({
  item,
  stage,
  resourceOptions,
  trainingOptions,
  onClose,
}: {
  item: OnboardingItem | null;
  stage: OnboardingStage;
  resourceOptions: Option[];
  trainingOptions: Option[];
  onClose: () => void;
}) {
  const [linkKind, setLinkKind] = useState<LinkKind>(() => linkKindOf(item));
  const { form, onSubmit, submitting } = useActionForm({
    schema: onboardingSchema,
    defaultValues: {
      id: item?.id,
      stage: item?.stage ?? stage,
      title: item?.title ?? "",
      description: item?.description ?? "",
      url: item?.url ?? "",
      resource_id: item?.resource_id ?? "",
      training_id: item?.training_id ?? "",
    },
    // נשמר רק סוג הקישור שנבחר
    transform: (v) => ({
      ...v,
      url: linkKind === "url" ? v.url : "",
      resource_id: linkKind === "resource" ? v.resource_id : "",
      training_id: linkKind === "training" ? v.training_id : "",
    }),
    action: saveOnboardingItem,
    onSuccess: onClose,
  });
  const { control } = form;

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={item ? "עריכת פריט קליטה" : "פריט קליטה חדש"}
      description={item?.title}
      onSubmit={onSubmit}
      submitting={submitting}
    >
      <SelectField
        control={control}
        name="stage"
        label="שלב"
        options={ONBOARDING_STAGES.map((s) => ({ value: s, label: ONBOARDING_STAGE_LABELS[s] }))}
      />
      <TextField control={control} name="title" label="כותרת" required />
      <TextField control={control} name="description" label="הסבר קצר" multiline rows={2} />

      <fieldset className="space-y-3">
        <legend className="mb-1.5 text-sm font-semibold">לאן מוביל הפריט</legend>
        <div role="group" aria-label="סוג הקישור" className="flex flex-wrap gap-1.5">
          {LINK_KINDS.map((k) => (
            <button
              key={k.value}
              type="button"
              aria-pressed={linkKind === k.value}
              onClick={() => setLinkKind(k.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition",
                linkKind === k.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-background hover:border-primary/40 hover:text-primary",
              )}
            >
              {k.label}
            </button>
          ))}
        </div>
        {linkKind === "resource" ? (
          <SelectField control={control} name="resource_id" label="משאב" options={resourceOptions} placeholder="בחירת משאב" />
        ) : null}
        {linkKind === "training" ? (
          <SelectField control={control} name="training_id" label="הדרכה" options={trainingOptions} placeholder="בחירת הדרכה" />
        ) : null}
        {linkKind === "url" ? (
          <TextField
            control={control}
            name="url"
            label="כתובת"
            ltr
            type="url"
            inputMode="url"
            placeholder="https://"
            help="קישור מלא, או כתובת פנימית שמתחילה ב /"
          />
        ) : null}
      </fieldset>
    </FormDialog>
  );
}

function LinkMeta({ item }: { item: OnboardingRow }) {
  if (item.resource_id) {
    return (
      <span className="inline-flex items-center gap-1">
        <Library className="size-3.5" aria-hidden="true" />
        {item.linkedTitle ?? "משאב שלא נמצא"}
      </span>
    );
  }
  if (item.training_id) {
    return (
      <span className="inline-flex items-center gap-1">
        <GraduationCap className="size-3.5" aria-hidden="true" />
        {item.linkedTitle ?? "הדרכה שלא נמצאה"}
      </span>
    );
  }
  if (item.url) {
    return (
      <span className="inline-flex items-center gap-1" dir="ltr">
        <ExternalLink className="size-3.5" aria-hidden="true" />
        {item.url}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1">
      <Link2 className="size-3.5" aria-hidden="true" />
      בלי קישור
    </span>
  );
}

export function OnboardingManager({
  items,
  resourceOptions,
  trainingOptions,
}: {
  items: OnboardingRow[];
  resourceOptions: Option[];
  trainingOptions: Option[];
}) {
  const [editing, setEditing] = useState<{ item: OnboardingItem | null; stage: OnboardingStage } | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button onClick={() => setEditing({ item: null, stage: "day1" })}>
          <Plus aria-hidden="true" />
          פריט חדש
        </Button>
      </div>

      {ONBOARDING_STAGES.map((stage) => {
        const list = items.filter((i) => i.stage === stage);
        return (
          <ListGroup
            key={stage}
            id={`stage-${stage}`}
            title={ONBOARDING_STAGE_LABELS[stage]}
            count={list.length}
            action={
              <Button variant="ghost" size="sm" className="text-primary" onClick={() => setEditing({ item: null, stage })}>
                <Plus aria-hidden="true" />
                הוספה
              </Button>
            }
          >
            {list.length === 0 ? (
              <p className="rounded-2xl border border-dashed bg-card px-4 py-5 text-center text-sm text-muted-foreground">
                אין פריטים בשלב הזה
              </p>
            ) : (
              <AdminList label={ONBOARDING_STAGE_LABELS[stage]}>
                {list.map((item, i) => (
                  <AdminListItem
                    key={item.id}
                    title={item.title}
                    titleExtra={
                      (item.resource_id || item.training_id) && !item.linkedTitle ? (
                        <StatusBadge tone="warning">הקישור לא תקין</StatusBadge>
                      ) : null
                    }
                    subtitle={item.description}
                    meta={<LinkMeta item={item} />}
                    actions={
                      <RowActions
                        label={item.title}
                        id={item.id}
                        onEdit={() => setEditing({ item, stage })}
                        deleteTable="onboarding_items"
                        move={{ table: "onboarding_items", canUp: i > 0, canDown: i < list.length - 1 }}
                      />
                    }
                  />
                ))}
              </AdminList>
            )}
          </ListGroup>
        );
      })}

      {editing ? (
        <OnboardingForm
          key={editing.item?.id ?? `new-${editing.stage}`}
          item={editing.item}
          stage={editing.stage}
          resourceOptions={resourceOptions}
          trainingOptions={trainingOptions}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </div>
  );
}
