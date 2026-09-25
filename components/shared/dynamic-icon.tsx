import type { LucideProps } from "lucide-react";
import { getIcon, type IconName } from "@/lib/icons";

/** אייקון לפי שם שנשמר בבסיס הנתונים */
export function DynamicIcon({
  name,
  fallback,
  ...props
}: { name: string | null | undefined; fallback?: IconName } & Omit<LucideProps, "name">) {
  const Icon = getIcon(name, fallback);
  return <Icon aria-hidden="true" {...props} />;
}
