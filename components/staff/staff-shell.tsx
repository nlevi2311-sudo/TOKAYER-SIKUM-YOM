import type { ReactNode } from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { CommandPalette } from "./command-palette";
import { EmergencyButton } from "./emergency-button";
import { MobileMenu } from "./mobile-menu";
import { BottomNav, NavLinks } from "./nav-links";
import { STAFF_BOTTOM_NAV, STAFF_NAV_CONTENT, STAFF_NAV_MAIN } from "./nav";
import { UserMenu } from "./user-menu";
import type { EmergencyProtocol, SessionUser } from "@/types";

/**
 * המעטפת של אזור הצוות.
 * מחשב: תפריט צד קבוע + סרגל עליון עם חיפוש וחירום.
 * טלפון: סרגל עליון קומפקטי + ניווט תחתון + תפריט המבורגר.
 */
export function StaffShell({
  user,
  emergencies,
  children,
}: {
  user: SessionUser;
  emergencies: EmergencyProtocol[];
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh bg-surface/50">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-e bg-card lg:flex">
        <div className="flex h-20 items-center px-5">
          <Logo height={34} href="/staff" priority />
        </div>
        <nav aria-label="ניווט ראשי" className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
          <NavLinks items={STAFF_NAV_MAIN} />
          <NavLinks title="תוכן" items={STAFF_NAV_CONTENT} />
        </nav>
        {user.isAdmin ? (
          <div className="border-t p-3">
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] text-foreground/80 hover:bg-surface hover:text-foreground"
            >
              <Settings className="size-5 text-muted-foreground" /> ממשק ניהול
            </Link>
          </div>
        ) : null}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b bg-card/90 pt-safe backdrop-blur supports-[backdrop-filter]:bg-card/75">
          <div className="flex h-16 items-center gap-2 px-3 sm:px-6 lg:h-20">
            <MobileMenu isAdmin={user.isAdmin} />
            <div className="lg:hidden">
              <Logo height={26} href="/staff" priority />
            </div>
            <div className="hidden flex-1 lg:block">
              <CommandPalette />
            </div>
            <div className="ms-auto flex items-center gap-2 sm:gap-3">
              <EmergencyButton protocols={emergencies} variant="pill" className="hidden sm:inline-flex" />
              <EmergencyButton protocols={emergencies} variant="compact" className="sm:hidden" />
              <UserMenu user={user} />
            </div>
          </div>
          {user.isDemo ? (
            <p className="bg-highlight/15 px-4 py-1.5 text-center text-xs text-[#7a4f00]">
              מצב הדגמה: נתונים לדוגמה בלבד. שינויים בממשק הניהול לא נשמרים עד לחיבור Supabase.
            </p>
          ) : null}
        </header>

        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-8">
          {children}
        </main>
      </div>

      <BottomNav items={STAFF_BOTTOM_NAV} />
    </div>
  );
}
