import type { Metadata } from "next";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { IconBadge } from "@/components/shared/icon-badge";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "אין הרשאה",
  robots: { index: false, follow: false },
};

export default async function UnauthorizedPage() {
  const user = await getSessionUser();
  return (
    <AuthLayout>
      <div className="space-y-5 text-center">
        <div className="flex justify-center">
          <IconBadge name="lock" size="lg" tone="warm" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-extrabold">החשבון שלך אינו מורשה להיכנס לאזור הצוות.</h1>
          {user ? (
            <p className="text-sm text-muted-foreground">
              התחברת בתור <span dir="ltr" className="font-medium text-foreground">{user.email}</span>.
            </p>
          ) : null}
          <p className="text-sm text-muted-foreground">
            אם אתם עובדי טוקאייר, פנו להנהלה כדי שיאשרו את החשבון. אחרי האישור פשוט נכנסים שוב.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {user ? (
            <form action={signOut}>
              <Button type="submit" variant="outline" className="h-11 w-full rounded-xl">
                <LogOut /> כניסה עם חשבון אחר
              </Button>
            </form>
          ) : (
            <Button asChild className="h-11 rounded-xl">
              <Link href="/login">לכניסה</Link>
            </Button>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
