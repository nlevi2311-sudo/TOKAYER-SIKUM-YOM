"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/brand/logo";
import { NavLinks } from "./nav-links";
import { STAFF_NAV_CONTENT, STAFF_NAV_MAIN } from "./nav";

/** תפריט ההמבורגר במובייל: כל האזורים שלא נכנסו לניווט התחתון */
export function MobileMenu({ isAdmin }: { isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="פתיחת התפריט" className="lg:hidden">
          <Menu className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[85vw] max-w-xs overflow-y-auto p-4">
        <SheetHeader className="p-0 pt-1 text-start">
          <SheetTitle className="sr-only">תפריט</SheetTitle>
          <SheetDescription className="sr-only">כל האזורים של אזור הצוות</SheetDescription>
          <Logo height={30} href="/staff" />
        </SheetHeader>
        <div className="mt-4 space-y-6">
          <NavLinks items={STAFF_NAV_MAIN} onNavigate={close} />
          <NavLinks title="תוכן" items={STAFF_NAV_CONTENT} onNavigate={close} />
          {isAdmin ? (
            <Link
              href="/admin"
              onClick={close}
              className="flex items-center gap-3 rounded-xl border px-3 py-2.5 text-[15px] font-medium hover:bg-surface"
            >
              <Settings className="size-5 text-muted-foreground" /> ממשק ניהול
            </Link>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
