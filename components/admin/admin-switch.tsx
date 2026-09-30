"use client";

import type { ComponentProps } from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/** מתג לממשק הניהול. תיקון הכיוון מימין לשמאל נמצא ב components/ui/switch.tsx */
export function AdminSwitch({ className, ...props }: ComponentProps<typeof Switch>) {
  return (
    <Switch
      className={cn(className)}
      {...props}
    />
  );
}
