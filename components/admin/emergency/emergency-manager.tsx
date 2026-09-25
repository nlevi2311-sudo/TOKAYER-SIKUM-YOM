"use client";

import { useState } from "react";
import { useFieldArray } from "react-hook-form";
import { Phone, Plus, ShieldAlert, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { IconBadge } from "@/components/shared/icon-badge";
import { Notice } from "@/components/admin/admin-list";
import { FieldGrid, FormDialog } from "@/components/admin/form-dialog";
import { FormSection, IconField, SelectField, TextField } from "@/components/admin/form-fields";
import { RowActions } from "@/components/admin/row-actions";
import { StatusBadge } from "@/components/admin/status-badge";
import { useActionForm } from "@/components/admin/use-action";
import { linesToText } from "@/components/admin/utils";
import { saveEmergency } from "@/lib/actions/admin";
import { emergencySchema } from "@/lib/validations/admin";
import type { EmergencyProtocol } from "@/types";

const APPROVED_NOTE = "יש להזין רק הנחיות מאושרות מתוך ספר הנהלים";

type ProcedureOption = { id: string; title: string };

function EmergencyForm({
  protocol,
  procedures,
  onClose,
}: {
  protocol: EmergencyProtocol | null;
  procedures: ProcedureOption[];
  onClose: () => void;
}) {
  const { form, onSubmit, submitting } = useActionForm({
    schema: emergencySchema,
    defaultValues: {
      id: protocol?.id,
      title: protocol?.title ?? "",
      slug: protocol?.slug ?? "",
      icon: protocol?.icon ?? "",
      now_steps: linesToText(protocol?.now_steps),
      call_list: protocol?.call_list.map((c) => ({ label: c.label, phone: c.phone })) ?? [],
      dont_list: linesToText(protocol?.dont_list),
      report_text: protocol?.report_text ?? "",
      report_url: protocol?.report_url ?? "",
      procedure_id: protocol?.procedure_id ?? "",
    },
    action: saveEmergency,
    onSuccess: onClose,
  });
  const { control } = form;
  const calls = useFieldArray({ control, name: "call_list" });

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={protocol ? "עריכת כרטיס חירום" : "כרטיס חירום חדש"}
      description={protocol?.title}
      onSubmit={onSubmit}
      submitting={submitting}
      size="lg"
    >
      <Notice tone="emergency" icon={<ShieldAlert className="text-emergency" />} title={APPROVED_NOTE}>
        הכרטיס מוצג לצוות ברגע לחץ. ניסוח קצר, פעולות ברורות, בלי פרשנות.
      </Notice>

      <FormSection title="כרטיס">
        <FieldGrid>
          <TextField control={control} name="title" label="כותרת" required placeholder="בריחה או היעדרות" />
          <TextField control={control} name="slug" label="מזהה באנגלית" required ltr placeholder="runaway" help="אותיות אנגליות קטנות, ספרות ומקף בין מילים" />
        </FieldGrid>
        <IconField control={control} name="icon" label="אייקון" />
      </FormSection>

      <FormSection title="מה עושים עכשיו">
        <TextField
          control={control}
          name="now_steps"
          label="צעדים לפי הסדר"
          multiline
          rows={6}
          help="צעד אחד בכל שורה. הצעדים ימוספרו אוטומטית."
        />
      </FormSection>

      <FormSection title="למי מתקשרים" description="לפי סדר הפנייה.">
        {calls.fields.length === 0 ? (
          <p className="rounded-xl border border-dashed px-3 py-4 text-center text-sm text-muted-foreground">עדיין אין גורמים ברשימה</p>
        ) : (
          <ol className="space-y-3">
            {calls.fields.map((field, index) => (
              <li key={field.id} className="flex items-start gap-2 rounded-xl border bg-surface/50 p-3">
                <span className="mt-8 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-emergency-soft text-xs font-bold text-emergency">
                  {index + 1}
                </span>
                <FieldGrid className="flex-1">
                  <TextField control={control} name={`call_list.${index}.label`} label="למי" required placeholder="כונן הנהלה" />
                  <TextField control={control} name={`call_list.${index}.phone`} label="טלפון" ltr type="tel" inputMode="tel" />
                </FieldGrid>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="mt-7 text-muted-foreground hover:text-destructive"
                  aria-label={`הסרת גורם ${index + 1}`}
                  onClick={() => calls.remove(index)}
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ol>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={calls.fields.length >= 12}
          onClick={() => calls.append({ label: "", phone: "" })}
        >
          <Plus aria-hidden="true" />
          הוספת גורם
        </Button>
      </FormSection>

      <FormSection title="מה לא עושים">
        <TextField control={control} name="dont_list" label="דגשים" multiline rows={4} help="דגש אחד בכל שורה" />
      </FormSection>

      <FormSection title="דיווח ונוהל מלא">
        <TextField control={control} name="report_text" label="הנחיית דיווח" multiline rows={2} help="למשל: דיווח באירוע חריג עד סוף המשמרת" />
        <FieldGrid>
          <TextField control={control} name="report_url" label="קישור לטופס הדיווח" ltr type="url" inputMode="url" placeholder="https://" />
          <SelectField
            control={control}
            name="procedure_id"
            label="הנוהל המלא"
            options={procedures.map((p) => ({ value: p.id, label: p.title }))}
            emptyLabel="ללא נוהל מקושר"
          />
        </FieldGrid>
      </FormSection>
    </FormDialog>
  );
}

export function EmergencyManager({
  protocols,
  procedures,
}: {
  protocols: EmergencyProtocol[];
  procedures: ProcedureOption[];
}) {
  const [editing, setEditing] = useState<{ protocol: EmergencyProtocol | null } | null>(null);

  return (
    <div className="space-y-5">
      <Notice tone="emergency" icon={<ShieldAlert className="text-emergency" />} title={APPROVED_NOTE}>
        כל שינוי כאן מופיע מיד במסך החירום של הצוות. מומלץ שהנוסח יאושר על ידי ההנהלה לפני השמירה.
      </Notice>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {protocols.length === 1 ? "כרטיס אחד" : `${protocols.length} כרטיסים`}
        </p>
        <Button onClick={() => setEditing({ protocol: null })}>
          <Plus aria-hidden="true" />
          כרטיס חדש
        </Button>
      </div>

      {protocols.length === 0 ? (
        <EmptyState icon="siren" title="אין עדיין כרטיסי חירום" />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {protocols.map((p, i) => (
            <li key={p.id} className="flex flex-col gap-4 rounded-2xl border bg-card p-5">
              <div className="flex items-start gap-3">
                <IconBadge name={p.icon} fallback="siren" tone="emergency" />
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold">{p.title}</h2>
                  <p className="text-xs text-muted-foreground" dir="ltr">
                    {p.slug}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <StatusBadge tone="muted">{p.now_steps.length} צעדים</StatusBadge>
                <StatusBadge tone="muted">
                  <Phone aria-hidden="true" />
                  {p.call_list.length} גורמים
                </StatusBadge>
                <StatusBadge tone="muted">{p.dont_list.length} דגשים</StatusBadge>
                {p.procedure ? (
                  <StatusBadge tone="teal">נוהל: {p.procedure.title}</StatusBadge>
                ) : (
                  <StatusBadge tone="warning">אין נוהל מקושר</StatusBadge>
                )}
              </div>
              {p.now_steps.length > 0 ? (
                <ol className="list-decimal space-y-1 ps-5 text-sm text-foreground/85 marker:text-muted-foreground">
                  {p.now_steps.slice(0, 3).map((s, si) => (
                    <li key={si} className="line-clamp-1">
                      {s}
                    </li>
                  ))}
                  {p.now_steps.length > 3 ? (
                    <li className="list-none text-xs text-muted-foreground">ועוד {p.now_steps.length - 3}</li>
                  ) : null}
                </ol>
              ) : null}
              <div className="mt-auto flex items-center justify-between gap-2 border-t pt-3">
                <Button variant="outline" size="sm" onClick={() => setEditing({ protocol: p })}>
                  עריכת הכרטיס
                </Button>
                <RowActions
                  label={p.title}
                  id={p.id}
                  deleteTable="emergency_protocols"
                  move={{ table: "emergency_protocols", canUp: i > 0, canDown: i < protocols.length - 1 }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing ? (
        <EmergencyForm
          key={editing.protocol?.id ?? "new"}
          protocol={editing.protocol}
          procedures={procedures}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </div>
  );
}
