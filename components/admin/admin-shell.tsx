"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Eye, LogOut, Menu, X } from "lucide-react";
import { Direction } from "radix-ui";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { signOut } from "@/lib/actions/auth";
import { AdminNav } from "./admin-nav";

type ShellUser = { fullName: string; email: string };

function BrandBlock() {
  return (
    <div className="flex items-center gap-3">
      <Logo href="/admin" height={26} priority />
      <span className="shrink-0 rounded-full bg-warm-soft px-2.5 py-0.5 text-xs font-bold whitespace-nowrap text-warm">
        ממשק ניהול
      </span>
    </div>
  );
}

function SidebarFooter({ user }: { user: ShellUser }) {
  return (
    <div className="space-y-3 border-t pt-4">
      <Link
        href="/staff"
        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-primary hover:bg-brand-soft"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        חזרה לאזור הצוות
      </Link>
      <div className="flex items-center justify-between gap-2 rounded-xl bg-surface px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{user.fullName}</p>
          <p className="truncate text-xs text-muted-foreground" dir="ltr">
            {user.email}
          </p>
        </div>
        <form action={signOut}>
          <Button type="submit" variant="ghost" size="icon-sm" aria-label="התנתקות" title="התנתקות">
            <LogOut />
          </Button>
        </form>
      </div>
    </div>
  );
}

export function AdminShell({ user, demo, children }: { user: ShellUser; demo: boolean; children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Direction.Provider dir="rtl">
      <div className="flex min-h-dvh flex-1 bg-surface">
        {/* סרגל צד בדסקטופ. בכיוון ימין לשמאל הוא מופיע בצד ימין */}
        <aside className="hidden w-64 shrink-0 border-e bg-background lg:block">
          <div className="sticky top-0 flex h-dvh flex-col gap-6 overflow-y-auto px-4 py-5">
            <BrandBlock />
            <div className="flex-1">
              <AdminNav />
            </div>
            <SidebarFooter user={user} />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* סרגל עליון בטלפון */}
          <header className="pt-safe sticky top-0 z-40 border-b bg-background/95 backdrop-blur lg:hidden">
            <div className="flex h-14 items-center justify-between gap-3 px-4">
              <BrandBlock />
              <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="פתיחת תפריט הניהול">
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" showCloseButton={false} className="w-[85vw] max-w-xs gap-0 p-0">
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <SheetTitle className="text-base font-bold text-primary">ממשק ניהול</SheetTitle>
                    <SheetDescription className="sr-only">ניווט בין אזורי הניהול</SheetDescription>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon-sm" aria-label="סגירת התפריט">
                        <X />
                      </Button>
                    </SheetClose>
                  </div>
                  <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
                    <div className="flex-1">
                      <AdminNav onNavigate={() => setMenuOpen(false)} />
                    </div>
                    <SidebarFooter user={user} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </header>

          {demo ? (
            <div role="status" className="border-b border-highlight/30 bg-highlight/10 px-4 py-2 text-center text-sm text-[#7a4f00]">
              <Eye className="me-1.5 inline size-4 align-[-3px]" aria-hidden="true" />
              מצב הדגמה: אפשר לנסות הכל, אבל שינויים לא נשמרים.
            </div>
          ) : null}

          <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 outline-none sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </Direction.Provider>
  );
}
