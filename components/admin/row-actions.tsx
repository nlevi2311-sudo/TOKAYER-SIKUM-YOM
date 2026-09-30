"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteItem, moveItem } from "@/lib/actions/admin";
import type { ReorderableTable } from "@/lib/validations/admin";
import { cn } from "@/lib/utils";
import { useRunAction } from "./use-action";

export type DeletableTable = ReorderableTable | "announcements" | "access_allowlist";

/** כפתורי פעולה לשורה: הזזה למעלה ולמטה, עריכה ומחיקה (עם אישור) */
export function RowActions({
  label,
  id,
  onEdit,
  deleteTable,
  deleteDescription,
  move,
  children,
  className,
}: {
  /** שם הפריט, לתוויות נגישות ולחלון האישור */
  label: string;
  id: string;
  onEdit?: () => void;
  deleteTable?: DeletableTable;
  deleteDescription?: string;
  move?: { table: ReorderableTable; canUp: boolean; canDown: boolean };
  children?: ReactNode;
  className?: string;
}) {
  const { run, pending } = useRunAction();

  return (
    <div className={cn("flex shrink-0 items-center gap-0.5", className)}>
      {children}
      {move ? (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`הזזת ${label} למעלה`}
            title="למעלה"
            disabled={pending || !move.canUp}
            onClick={() => run(() => moveItem({ table: move.table, id, direction: "up" }), "הסדר עודכן")}
          >
            <ArrowUp />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`הזזת ${label} למטה`}
            title="למטה"
            disabled={pending || !move.canDown}
            onClick={() => run(() => moveItem({ table: move.table, id, direction: "down" }), "הסדר עודכן")}
          >
            <ArrowDown />
          </Button>
        </>
      ) : null}
      {onEdit ? (
        <Button type="button" variant="ghost" size="icon-sm" aria-label={`עריכת ${label}`} title="עריכה" onClick={onEdit}>
          <Pencil />
        </Button>
      ) : null}
      {deleteTable ? (
        <ConfirmDialog
          title={`למחוק את "${label}"?`}
          description={deleteDescription ?? "אי אפשר לבטל את הפעולה."}
          onConfirm={() => run(() => deleteItem({ table: deleteTable, id }), "נמחק")}
          trigger={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`מחיקת ${label}`}
              title="מחיקה"
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 />
            </Button>
          }
        />
      ) : null}
    </div>
  );
}
