"use client";

import { useId, type ReactNode } from "react";
import {
  useController,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AdminSwitch } from "./admin-switch";
import { IconPicker } from "./icon-picker";
import { RolesPicker } from "./roles-picker";
import { NONE_VALUE } from "./utils";
import type { AppRole } from "@/types";

// ---------------------------------------------------------------------
// מעטפת שדה: תווית, עזרה והודעת שגיאה
// ---------------------------------------------------------------------
export type FieldIds = { id: string; helpId: string; errorId: string; describedBy: string | undefined };

export function useFieldIds(help?: ReactNode, error?: string): FieldIds {
  const id = useId();
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const describedBy = [help ? helpId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;
  return { id, helpId, errorId, describedBy };
}

export function Field({
  ids,
  label,
  help,
  error,
  required,
  className,
  children,
}: {
  ids: FieldIds;
  label: ReactNode;
  help?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={ids.id} className="text-sm font-semibold">
        {label}
        {required ? (
          <span className="text-warm" aria-hidden="true">
            *
          </span>
        ) : null}
      </Label>
      {children}
      {help ? (
        <p id={ids.helpId} className="text-xs leading-relaxed text-muted-foreground">
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={ids.errorId} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type BaseProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: ReactNode;
  help?: ReactNode;
  required?: boolean;
  className?: string;
  disabled?: boolean;
};

// ---------------------------------------------------------------------
// טקסט, כתובת, תאריך, טקסט ארוך
// ---------------------------------------------------------------------
export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  help,
  required,
  className,
  disabled,
  multiline,
  rows = 4,
  ltr,
  type = "text",
  placeholder,
  inputMode,
  autoComplete,
}: BaseProps<T> & {
  multiline?: boolean;
  rows?: number;
  /** לכתובות, מיילים, טלפונים ומזהים באנגלית */
  ltr?: boolean;
  type?: "text" | "url" | "email" | "tel" | "date" | "datetime-local" | "number";
  placeholder?: string;
  inputMode?: "text" | "url" | "email" | "tel" | "numeric";
  autoComplete?: string;
}) {
  const { field, fieldState } = useController({ control, name });
  const error = fieldState.error?.message;
  const ids = useFieldIds(help, error);
  const common = {
    id: ids.id,
    name: field.name,
    ref: field.ref,
    value: field.value == null ? "" : String(field.value),
    onChange: field.onChange,
    onBlur: field.onBlur,
    disabled,
    placeholder,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": ids.describedBy,
    "aria-required": required || undefined,
    dir: ltr ? ("ltr" as const) : undefined,
  };

  return (
    <Field ids={ids} label={label} help={help} error={error} required={required} className={className}>
      {multiline ? (
        <Textarea rows={rows} {...common} className="min-h-20 leading-relaxed" />
      ) : (
        <Input type={type} inputMode={inputMode} autoComplete={autoComplete ?? "off"} {...common} />
      )}
    </Field>
  );
}

// ---------------------------------------------------------------------
// בחירה מרשימה
// ---------------------------------------------------------------------
export type Option = { value: string; label: string; group?: string };

export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  help,
  required,
  className,
  disabled,
  options,
  placeholder = "בחירה",
  emptyLabel,
}: BaseProps<T> & {
  options: Option[];
  placeholder?: string;
  /** אם מוגדר, מתווספת אפשרות "ללא" שנשמרת כמחרוזת ריקה */
  emptyLabel?: string;
}) {
  const { field, fieldState } = useController({ control, name });
  const error = fieldState.error?.message;
  const ids = useFieldIds(help, error);
  const raw = field.value == null ? "" : String(field.value);
  const value = raw === "" ? (emptyLabel ? NONE_VALUE : "") : raw;

  return (
    <Field ids={ids} label={label} help={help} error={error} required={required} className={className}>
      <SelectBox
        id={ids.id}
        value={value}
        onChange={(v) => field.onChange(v === NONE_VALUE ? "" : v)}
        onBlur={field.onBlur}
        options={options}
        emptyLabel={emptyLabel}
        placeholder={placeholder}
        disabled={disabled}
        invalid={Boolean(error)}
        describedBy={ids.describedBy}
      />
    </Field>
  );
}

/** Select בסיסי, גם לשימוש מחוץ לטופס */
export function SelectBox({
  id,
  value,
  onChange,
  onBlur,
  options,
  emptyLabel,
  placeholder = "בחירה",
  disabled,
  invalid,
  describedBy,
  className,
  ariaLabel,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: Option[];
  emptyLabel?: string;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const groups = new Map<string, Option[]>();
  for (const o of options) {
    const key = o.group ?? "";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(o);
  }

  return (
    <Select
      value={value || undefined}
      onValueChange={onChange}
      disabled={disabled}
      onOpenChange={(open) => {
        if (!open) onBlur?.();
      }}
    >
      <SelectTrigger
        id={id}
        className={cn("w-full bg-background", className)}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        aria-label={ariaLabel}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent position="popper" className="max-h-72">
        {emptyLabel ? (
          <SelectItem value={NONE_VALUE} className="text-muted-foreground">
            {emptyLabel}
          </SelectItem>
        ) : null}
        {[...groups.entries()].map(([group, items]) => (
          <div key={group || "_"} role={group ? "group" : undefined} aria-label={group || undefined}>
            {group ? <p className="px-2 pt-2 pb-1 text-xs font-semibold text-muted-foreground">{group}</p> : null}
            {items.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </div>
        ))}
      </SelectContent>
    </Select>
  );
}

// ---------------------------------------------------------------------
// מתג כן/לא
// ---------------------------------------------------------------------
export function SwitchField<T extends FieldValues>({
  control,
  name,
  label,
  help,
  className,
  disabled,
}: BaseProps<T>) {
  const {
    field: { value, onChange },
  } = useController({ control, name });
  const ids = useFieldIds(help);
  return (
    <div className={cn("flex items-start justify-between gap-4 rounded-xl border bg-background p-3", className)}>
      <div className="space-y-0.5">
        <Label htmlFor={ids.id} className="text-sm font-semibold">
          {label}
        </Label>
        {help ? (
          <p id={ids.helpId} className="text-xs text-muted-foreground">
            {help}
          </p>
        ) : null}
      </div>
      <AdminSwitch
        id={ids.id}
        checked={Boolean(value)}
        onCheckedChange={onChange}
        disabled={disabled}
        aria-describedby={ids.describedBy}
        className="mt-0.5"
      />
    </div>
  );
}

// ---------------------------------------------------------------------
// תיבת סימון בודדת
// ---------------------------------------------------------------------
export function CheckboxField<T extends FieldValues>({ control, name, label, help, className, disabled }: BaseProps<T>) {
  const {
    field: { value, onChange },
  } = useController({ control, name });
  const ids = useFieldIds(help);
  return (
    <div className={cn("flex items-start gap-2.5", className)}>
      <Checkbox
        id={ids.id}
        checked={Boolean(value)}
        onCheckedChange={(v) => onChange(v === true)}
        disabled={disabled}
        aria-describedby={ids.describedBy}
        className="mt-0.5"
      />
      <div className="space-y-0.5">
        <Label htmlFor={ids.id} className="text-sm font-medium">
          {label}
        </Label>
        {help ? (
          <p id={ids.helpId} className="text-xs text-muted-foreground">
            {help}
          </p>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// אייקון
// ---------------------------------------------------------------------
export function IconField<T extends FieldValues>({ control, name, label, help, className, disabled }: BaseProps<T>) {
  const { field, fieldState } = useController({ control, name });
  const error = fieldState.error?.message;
  const ids = useFieldIds(help, error);
  return (
    <Field ids={ids} label={label} help={help} error={error} className={className}>
      <IconPicker
        id={ids.id}
        value={field.value == null ? "" : String(field.value)}
        onChange={field.onChange}
        disabled={disabled}
        describedBy={ids.describedBy}
      />
    </Field>
  );
}

// ---------------------------------------------------------------------
// הרשאות לפי תפקיד
// ---------------------------------------------------------------------
export function RolesField<T extends FieldValues>({
  control,
  name,
  label = "מי רואה",
  help = "בלי סימון = כל אנשי הצוות. אדמין רואה הכל.",
  className,
  disabled,
}: Omit<BaseProps<T>, "label"> & { label?: ReactNode }) {
  const { field, fieldState } = useController({ control, name });
  const error = fieldState.error?.message;
  const value = Array.isArray(field.value) ? (field.value as AppRole[]) : [];
  return (
    <fieldset className={cn("space-y-2", className)} disabled={disabled}>
      <legend className="text-sm font-semibold">{label}</legend>
      <p className="text-xs text-muted-foreground">{help}</p>
      <RolesPicker value={value} onChange={field.onChange} />
      {error ? (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

/** כותרת לקבוצת שדות בתוך טופס */
export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="space-y-0.5 border-b pb-2">
        <h3 className="text-sm font-bold text-primary">{title}</h3>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
