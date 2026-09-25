"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isActivePath, publicNav } from "./nav";

export function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="ניווט ראשי" className="hidden lg:block">
      <ul role="list" className="flex items-center gap-1">
        {publicNav.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-3 py-2 text-[15px] font-medium transition-colors hover:bg-brand-soft hover:text-primary",
                  active ? "text-primary" : "text-foreground/80",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
