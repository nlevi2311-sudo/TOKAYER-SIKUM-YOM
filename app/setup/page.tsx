import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { IconBadge } from "@/components/shared/icon-badge";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "הגדרת המערכת",
  robots: { index: false, follow: false },
};

export default function SetupPage() {
  if (isSupabaseConfigured()) redirect("/login");
  return (
    <AuthLayout>
      <div className="space-y-4 text-start">
        <IconBadge name="settings" size="lg" />
        <h1 className="text-xl font-extrabold text-primary">אזור הצוות עדיין לא חובר</h1>
        <p className="text-sm text-muted-foreground">
          כדי להפעיל את אזור הצוות צריך לחבר את Supabase. מגדירים את משתני הסביבה הבאים ב Vercel (או בקובץ .env.local
          בפיתוח) ומפעילים מחדש:
        </p>
        <ul className="space-y-1 rounded-xl bg-surface p-3 font-mono text-xs" dir="ltr">
          <li>NEXT_PUBLIC_SUPABASE_URL</li>
          <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
          <li>NEXT_PUBLIC_SITE_URL</li>
        </ul>
        <p className="text-sm text-muted-foreground">
          ההוראות המלאות נמצאות בקובץ README. להדגמה בלי Supabase מגדירים NEXT_PUBLIC_DEMO_MODE=true.
        </p>
      </div>
    </AuthLayout>
  );
}
