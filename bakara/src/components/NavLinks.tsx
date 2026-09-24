"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string; icon: string };

export function TopNav({ items }: { items: NavItem[] }) {
  const path = usePathname();
  return (
    <nav className="hidden gap-1 md:flex">
      {items.map((i) => {
        const active = path === i.href || path.startsWith(i.href + "/");
        return (
          <Link
            key={i.href}
            href={i.href}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${active ? "bg-white/20" : "hover:bg-white/10"}`}
          >
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function BottomNav({ items }: { items: NavItem[] }) {
  const path = usePathname();
  return (
    <nav className="no-print fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      {items.slice(0, 5).map((i) => {
        const active = path === i.href || path.startsWith(i.href + "/");
        return (
          <Link
            key={i.href}
            href={i.href}
            className={`flex flex-1 flex-col items-center py-2 text-xs font-semibold ${active ? "text-brand" : "text-slate-500"}`}
          >
            <span className="text-xl leading-6" aria-hidden>
              {i.icon}
            </span>
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
