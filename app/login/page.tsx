import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth/session";
import { safeNextPath } from "@/lib/auth/redirect";
import { isDemoMode, isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "כניסת צוות",
  robots: { index: false, follow: false },
};

const ERRORS: Record<string, string> = {
  callback: "ההתחברות לא הושלמה. נסו שוב.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = safeNextPath(typeof params.next === "string" ? params.next : null);
  const error = typeof params.error === "string" ? ERRORS[params.error] ?? "ההתחברות נכשלה." : null;

  if (!isSupabaseConfigured() && !isDemoMode()) redirect("/setup");

  const user = await getSessionUser();
  if (user?.active) redirect(next);
  if (user && !user.active) redirect("/unauthorized");

  return (
    <AuthLayout>
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <p className="eyebrow">אזור הצוות</p>
          <h1 className="text-2xl font-extrabold text-primary">טוקאייר במקום אחד</h1>
          <p className="text-muted-foreground">מערכות, נהלים, טפסים והדרכות. כניסה לעובדי טוקאייר בלבד.</p>
        </div>

        {error ? (
          <p role="alert" className="rounded-xl bg-emergency-soft px-4 py-3 text-sm text-emergency">
            {error}
          </p>
        ) : null}
        {params.signedOut ? (
          <p role="status" className="rounded-xl bg-brand-soft px-4 py-3 text-sm text-primary">
            יצאת מהחשבון.
          </p>
        ) : null}

        {isDemoMode() ? (
          <div className="space-y-3">
            <Button asChild className="h-12 w-full rounded-xl text-base">
              <Link href="/staff">כניסה להדגמה</Link>
            </Button>
            <p className="text-xs text-muted-foreground">מצב הדגמה פעיל: אין חיבור ל Supabase והנתונים לדוגמה בלבד.</p>
          </div>
        ) : (
          <GoogleSignIn next={next} />
        )}

        <p className="text-xs leading-relaxed text-muted-foreground">
          הכניסה בחשבון Google הארגוני. חשבון חדש ממתין לאישור ההנהלה לפני הכניסה הראשונה.
        </p>
      </div>
    </AuthLayout>
  );
}
