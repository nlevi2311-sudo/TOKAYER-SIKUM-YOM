"use client";

import Link from "next/link";
import { LogOut, Settings, Star, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "@/lib/actions/auth";
import { ROLE_LABELS } from "@/lib/labels";
import { initialsOf } from "@/lib/text";
import type { SessionUser } from "@/types";

export function UserMenu({ user }: { user: SessionUser }) {
  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger
        className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
        aria-label={`תפריט משתמש: ${user.fullName}`}
      >
        <Avatar className="size-10 border">
          {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" referrerPolicy="no-referrer" /> : null}
          <AvatarFallback className="bg-brand-soft font-semibold text-primary">{initialsOf(user.fullName)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <span className="block font-semibold">{user.fullName}</span>
          <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
          <span className="mt-1 inline-block rounded-full bg-brand-soft px-2 py-0.5 text-[11px] text-primary">
            {ROLE_LABELS[user.role]}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/staff/profile">
            <UserRound /> הפרופיל שלי
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/staff/favorites">
            <Star /> המועדפים שלי
          </Link>
        </DropdownMenuItem>
        {user.isAdmin ? (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <Settings /> ממשק ניהול
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <form action={signOut}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full">
              <LogOut /> יציאה
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
