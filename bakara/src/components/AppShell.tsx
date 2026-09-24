import Link from "next/link";
import type { CurrentUser } from "@/lib/auth";
import { IDLE_MINUTES } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/checks";
import IdleLogout from "./IdleLogout";
import { BottomNav, NavItem, TopNav } from "./NavLinks";

function navFor(user: CurrentUser): NavItem[] {
  const shift: NavItem = { href: "/shift", label: "משמרת", icon: "📋" };
  const dashboard: NavItem = { href: "/dashboard", label: "מצב הכפר", icon: "🏠" };
  const exceptions: NavItem = { href: "/exceptions", label: "חריגים", icon: "⚠️" };
  const children: NavItem = { href: "/children", label: "ילדים", icon: "👦" };
  const reports: NavItem = { href: "/reports", label: "דוחות", icon: "📊" };
  const shifts: NavItem = { href: "/shifts", label: "משמרות", icon: "🕒" };
  const users: NavItem = { href: "/admin/users", label: "משתמשים", icon: "🔑" };
  const auditLog: NavItem = { href: "/audit", label: "יומן פעולות", icon: "📜" };
  if (user.role === "DUTY") return [shift, exceptions, children, shifts];
  if (user.role === "DIRECTOR") return [dashboard, exceptions, reports, children, shifts, auditLog];
  return [dashboard, shift, exceptions, children, reports, shifts, users, auditLog];
}

export default function AppShell({
  user,
  title,
  back,
  children,
}: {
  user: CurrentUser;
  title?: string;
  back?: string;
  children: React.ReactNode;
}) {
  const items = navFor(user);
  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <IdleLogout minutes={IDLE_MINUTES} />
      <header className="no-print sticky top-0 z-20 bg-brand text-white shadow">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          {back ? (
            <Link href={back} className="rounded-lg px-2 py-1 text-2xl leading-none hover:bg-white/10" aria-label="חזרה">
              →
            </Link>
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="truncate text-lg font-bold">{title ?? "מערכת בקרה למנהל תורן"}</div>
            <div className="truncate text-xs text-blue-100">
              {user.fullName} · {ROLE_LABELS[user.role]}
            </div>
          </div>
          <TopNav items={items} />
          <a href="/logout" className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-white/10">
            יציאה
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-4">{children}</main>
      <BottomNav items={items} />
    </div>
  );
}
