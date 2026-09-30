import { createElement } from "react";
import type { LucideProps } from "lucide-react";
import { getIcon, type IconName } from "@/lib/icons";

/** אייקון לפי שם שנשמר בבסיס הנתונים */
export function DynamicIcon({
  name,
  fallback,
  ...props
}: { name: string | null | undefined; fallback?: IconName } & Omit<LucideProps, "name">) {
  return createElement(getIcon(name, fallback), { "aria-hidden": true, ...props });
}
