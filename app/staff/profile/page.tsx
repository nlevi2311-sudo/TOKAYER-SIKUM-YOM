import type { Metadata } from "next";
import Link from "next/link";
import { LogOut, Settings, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InstallApp } from "@/components/shared/install-app";
import { PageHeader } from "@/components/shared/page-header";
import { signOut } from "@/lib/actions/auth";
import { requireStaff } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/lib/labels";
import { initialsOf } from "@/lib/text";

export const metadata: Metadata = { title: "פרופיל" };

export default async function ProfilePage() {
  const user = await requireStaff("/staff/profile");
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="הפרופיל שלי" breadcrumbs={[{ label: "בית", href: "/staff" }, { label: "פרופיל" }]} />

      <section className="flex items-center gap-4 rounded-2xl border bg-card p-5">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xl font-bold text-primary">
          {initialsOf(user.fullName)}
        </span>
        <div className="min-w-0">
          <p className="text-lg font-bold">{user.fullName}</p>
          <p className="truncate text-sm text-muted-foreground" dir="ltr">
            {user.email}
          </p>
          <span className="mt-1 inline-block rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-primary">
            {ROLE_LABELS[user.role]}
          </span>
        </div>
      </section>

      <nav className="grid gap-2 sm:grid-cols-2" aria-label="קיצורים">
        <Link href="/staff/favorites" className="flex items-center gap-3 rounded-2xl border bg-card p-4 hover:border-primary/40">
          <Star className="size-5 text-highlight" aria-hidden="true" /> המועדפים שלי
        </Link>
        {user.isAdmin ? (
          <Link href="/admin" className="flex items-center gap-3 rounded-2xl border bg-card p-4 hover:border-primary/40">
            <Settings className="size-5 text-primary" aria-hidden="true" /> ממשק ניהול
          </Link>
        ) : null}
      </nav>

      <InstallApp />

      <p className="text-sm text-muted-foreground">
        שינוי תפקיד או הרשאות נעשה על ידי ההנהלה. פרטי ההתחברות מגיעים מחשבון Google שלך.
      </p>

      <form action={signOut}>
        <Button type="submit" variant="outline" className="h-11 w-full rounded-xl sm:w-auto">
          <LogOut /> יציאה מהחשבון
        </Button>
      </form>
    </div>
  );
}
