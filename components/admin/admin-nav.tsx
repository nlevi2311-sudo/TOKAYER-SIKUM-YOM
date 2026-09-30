"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderTree,
  Globe,
  GraduationCap,
  LayoutDashboard,
  Library,
  Megaphone,
  Route,
  Siren,
  UsersRound,
  Contact,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: LucideIcon; exact?: boolean };
type NavGroup = { title?: string; items: NavItem[] };

export const ADMIN_NAV: NavGroup[] = [
  { items: [{ href: "/admin", label: "סקירה כללית", icon: LayoutDashboard, exact: true }] },
  {
    title: "תוכן לצוות",
    items: [
      { href: "/admin/resources", label: "משאבים וקישורים", icon: Library },
      { href: "/admin/categories", label: "קטגוריות", icon: FolderTree },
      { href: "/admin/announcements", label: "הודעות ועדכונים", icon: Megaphone },
      { href: "/admin/training", label: "הדרכות", icon: GraduationCap },
      { href: "/admin/contacts", label: "אנשי קשר", icon: Contact },
      { href: "/admin/emergency", label: "מסך חירום", icon: Siren },
      { href: "/admin/onboarding", label: "מסלול קליטה", icon: Route },
    ],
  },
  {
    title: "אתר ציבורי",
    items: [{ href: "/admin/content", label: "תוכן האתר", icon: Globe }],
  },
  {
    title: "הרשאות",
    items: [{ href: "/admin/users", label: "משתמשים והרשאות", icon: UsersRound }],
  },
];

export function isActivePath(pathname: string, item: Pick<NavItem, "href" | "exact">): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="ניווט ממשק הניהול" className="space-y-5">
      {ADMIN_NAV.map((group, gi) => (
        <div key={group.title ?? gi} className="space-y-1">
          {group.title ? (
            <p className="px-3 pb-1 text-xs font-semibold tracking-wide text-muted-foreground">{group.title}</p>
          ) : null}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActivePath(pathname, item);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                        : "text-foreground/80 hover:bg-brand-soft hover:text-primary",
                    )}
                  >
                    <Icon className="size-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
