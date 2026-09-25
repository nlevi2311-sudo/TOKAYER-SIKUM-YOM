"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, Menu, X } from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { publicButtonClass } from "./buttons";
import { isActivePath, publicNav, staffEntry } from "./nav";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="inline-flex size-11 items-center justify-center rounded-full text-primary transition-colors hover:bg-brand-soft lg:hidden"
        aria-label="פתיחת תפריט"
      >
        <Menu className="size-6" aria-hidden="true" />
      </SheetTrigger>
      <SheetContent side="right" className="w-[85%] max-w-sm gap-0 p-0" showCloseButton={false}>
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <SheetTitle className="sr-only">תפריט</SheetTitle>
          <SheetDescription className="sr-only">ניווט באתר טוקאייר</SheetDescription>
          <Logo height={30} href={null} />
          <SheetClose
            className="inline-flex size-10 items-center justify-center rounded-full text-foreground/70 hover:bg-muted"
            aria-label="סגירת תפריט"
          >
            <X className="size-5" aria-hidden="true" />
          </SheetClose>
        </div>
        <nav aria-label="ניווט ראשי" className="flex-1 overflow-y-auto px-3 py-4">
          <ul role="list" className="space-y-1">
            <li>
              <Link
                href="/"
                onClick={() => setOpen(false)}
                aria-current={pathname === "/" ? "page" : undefined}
                className={cn(
                  "block rounded-xl px-4 py-3 text-lg font-medium hover:bg-brand-soft",
                  pathname === "/" ? "text-primary" : "text-foreground",
                )}
              >
                דף הבית
              </Link>
            </li>
            {publicNav.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-xl px-4 py-3 text-lg font-medium hover:bg-brand-soft",
                      active ? "bg-brand-soft text-primary" : "text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-border/60 p-5 pb-safe">
          <Link href={staffEntry.href} onClick={() => setOpen(false)} className={publicButtonClass("primary", "w-full")}>
            <LogIn />
            {staffEntry.label}
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
