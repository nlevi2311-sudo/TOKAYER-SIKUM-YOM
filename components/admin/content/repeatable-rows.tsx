"use client";

import { useId, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IconPicker } from "@/components/admin/icon-picker";
import { SelectBox } from "@/components/admin/form-fields";
import { cn } from "@/lib/utils";

export type RowItem = Record<string, string>;

export type RowColumn = {
  key: string;
  label: string;
  kind: "text" | "textarea" | "url" | "icon" | "select";
  options?: string[];
  placeholder?: string;
  /** תופס את כל הרוחב */
  wide?: boolean;
};

let keySeed = 0;
const newKey = () => `row-${++keySeed}`;

/**
 * רשימה של שורות שאפשר להוסיף, למחוק ולהזיז (כרטיסים, ציר זמן, גלריה, אנשי צוות).
 * הערך נשמר כמערך אובייקטים, בדיוק כמו בסכמת התוכן.
 */
export function RepeatableRows({
  value,
  onChange,
  columns,
  emptyItem,
  itemLabel,
  titleKey,
  max,
  errorFor,
}: {
  value: RowItem[];
  onChange: (value: RowItem[]) => void;
  columns: RowColumn[];
  emptyItem: RowItem;
  itemLabel: string;
  titleKey: string;
  max?: number;
  errorFor: (index: number, key: string) => string | undefined;
}) {
  const baseId = useId();
  const [keys, setKeys] = useState<string[]>(() => value.map(() => newKey()));
  // אם הערך הוחלף מבחוץ (למשל שחזור), מייצרים מפתחות חדשים
  const rowKeys = keys.length === value.length ? keys : value.map((_, i) => keys[i] ?? `${baseId}-${i}`);

  function update(index: number, key: string, next: string) {
    onChange(value.map((item, i) => (i === index ? { ...item, [key]: next } : item)));
  }
  function add() {
    onChange([...value, { ...emptyItem }]);
    setKeys([...rowKeys, newKey()]);
  }
  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
    setKeys(rowKeys.filter((_, i) => i !== index));
  }
  function move(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= value.length) return;
    const nextValue = [...value];
    const nextKeys = [...rowKeys];
    [nextValue[index], nextValue[target]] = [nextValue[target], nextValue[index]];
    [nextKeys[index], nextKeys[target]] = [nextKeys[target], nextKeys[index]];
    onChange(nextValue);
    setKeys(nextKeys);
  }

  const full = max !== undefined && value.length >= max;

  return (
    <div className="space-y-3">
      {value.length === 0 ? (
        <p className="rounded-xl border border-dashed px-3 py-5 text-center text-sm text-muted-foreground">
          הרשימה ריקה
        </p>
      ) : (
        <ol className="space-y-3">
          {value.map((item, index) => {
            const heading = item[titleKey]?.trim() || `${itemLabel} ${index + 1}`;
            return (
              <li key={rowKeys[index]} className="rounded-xl border bg-surface/50">
                <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
                  <p className="min-w-0 truncate text-sm font-semibold">
                    <span className="me-1.5 text-muted-foreground tabular-nums">{index + 1}.</span>
                    {heading}
                  </p>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`הזזת ${heading} למעלה`}
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      <ArrowUp />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`הזזת ${heading} למטה`}
                      disabled={index === value.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <ArrowDown />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`הסרת ${heading}`}
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => remove(index)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
                <div className="grid gap-3 p-3 sm:grid-cols-2">
                  {columns.map((col) => {
                    const id = `${baseId}-${index}-${col.key}`;
                    const error = errorFor(index, col.key);
                    const errorId = `${id}-error`;
                    const cellValue = item[col.key] ?? "";
                    return (
                      <div key={col.key} className={cn("space-y-1.5", (col.wide || col.kind === "textarea") && "sm:col-span-2")}>
                        <Label htmlFor={id} className="text-xs font-semibold text-muted-foreground">
                          {col.label}
                        </Label>
                        {col.kind === "textarea" ? (
                          <Textarea
                            id={id}
                            rows={2}
                            value={cellValue}
                            onChange={(e) => update(index, col.key, e.target.value)}
                            aria-invalid={error ? true : undefined}
                            aria-describedby={error ? errorId : undefined}
                            className="min-h-16 bg-background"
                          />
                        ) : col.kind === "icon" ? (
                          <IconPicker id={id} value={cellValue} onChange={(v) => update(index, col.key, v)} />
                        ) : col.kind === "select" ? (
                          <SelectBox
                            id={id}
                            value={cellValue}
                            onChange={(v) => update(index, col.key, v)}
                            options={(col.options ?? []).map((o) => ({ value: o, label: o }))}
                            emptyLabel="ללא"
                            invalid={Boolean(error)}
                            describedBy={error ? errorId : undefined}
                          />
                        ) : (
                          <Input
                            id={id}
                            value={cellValue}
                            dir={col.kind === "url" ? "ltr" : undefined}
                            inputMode={col.kind === "url" ? "url" : undefined}
                            placeholder={col.placeholder}
                            onChange={(e) => update(index, col.key, e.target.value)}
                            aria-invalid={error ? true : undefined}
                            aria-describedby={error ? errorId : undefined}
                            className="bg-background"
                          />
                        )}
                        {error ? (
                          <p id={errorId} role="alert" className="text-xs font-medium text-destructive">
                            {error}
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ol>
      )}
      <Button type="button" variant="outline" size="sm" onClick={add} disabled={full}>
        <Plus aria-hidden="true" />
        הוספת {itemLabel}
      </Button>
      {full ? <p className="text-xs text-muted-foreground">הגעתם למספר המרבי ({max}).</p> : null}
    </div>
  );
}
