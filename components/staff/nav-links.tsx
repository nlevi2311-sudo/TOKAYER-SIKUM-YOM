"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DynamicIcon } from "@/components/shared/dynamic-icon";
import { cn } from "@/lib/utils";
import { isActivePath, type NavItem } from "./nav";

export function NavLinks({
  title,
  items,
  onNavigate,
}: {
  title?: string;
  items: NavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <div className="space-y-1">
      {title ? <p className="px-3 pb-1 text-xs font-semibold text-muted-foreground">{title}</p> : null}
      <ul className="space-y-0.5">
        {items.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition",
                  active ? "bg-brand-soft font-semibold text-primary" : "text-foreground/80 hover:bg-surface hover:text-foreground",
                )}
              >
                <DynamicIcon name={item.icon} className={cn("size-5", active ? "text-primary" : "text-muted-foreground")} strokeWidth={1.75} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="ניווט ראשי"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-safe backdrop-blur supports-[backdrop-filter]:bg-card/85 lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {items.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-[11px] transition",
                  active ? "font-semibold text-primary" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-12 items-center justify-center rounded-full transition",
                    active && "bg-brand-soft",
                  )}
                >
                  <DynamicIcon name={item.icon} className="size-5" strokeWidth={active ? 2 : 1.75} />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
