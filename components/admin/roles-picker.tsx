"use client";

import { useId } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ROLE_LABELS, ROLES } from "@/lib/labels";
import type { AppRole } from "@/types";

/** תפקידים שאפשר להגביל אליהם תוכן. אדמין רואה הכל, לכן לא מופיע ברשימה */
const PICKABLE_ROLES = ROLES.filter((r) => r !== "admin");

export function RolesPicker({ value, onChange }: { value: AppRole[]; onChange: (value: AppRole[]) => void }) {
  const baseId = useId();
  function toggle(role: AppRole, checked: boolean) {
    const next = checked ? [...value, role] : value.filter((r) => r !== role);
    onChange(ROLES.filter((r) => next.includes(r)));
  }
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl border bg-background p-3 sm:grid-cols-3">
      {PICKABLE_ROLES.map((role) => {
        const id = `${baseId}-${role}`;
        return (
          <div key={role} className="flex items-center gap-2">
            <Checkbox id={id} checked={value.includes(role)} onCheckedChange={(v) => toggle(role, v === true)} />
            <Label htmlFor={id} className="text-sm font-normal">
              {ROLE_LABELS[role]}
            </Label>
          </div>
        );
      })}
    </div>
  );
}
