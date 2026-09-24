import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "./LoginForm";
import { getMode } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ idle?: string; reset?: string }> }) {
  if (await getCurrentUser()) redirect("/");
  const { idle, reset } = await searchParams;
  const mode = await getMode();
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="card w-full max-w-sm space-y-5 p-6">
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-full.png" alt="טוקאייר · קבוצת גיא" className="mx-auto w-full max-w-xs" />
          <h1 className="h1 mt-4">בקרת מנהל תורן</h1>
          <p className="muted mt-1">כניסה אישית</p>
        </div>
        {idle ? (
          <div className="rounded-xl bg-warn-bg p-3 text-sm font-semibold text-warn">בוצעה יציאה אוטומטית בגלל חוסר פעילות</div>
        ) : null}
        {reset ? <div className="rounded-xl bg-ok-bg p-3 text-sm font-semibold text-ok">נתוני הדמה נטענו מחדש. יש להתחבר שוב.</div> : null}
        <LoginForm />
        {mode === "demo" ? (
          <p className="text-center text-xs text-slate-400">
            סביבת דמה. משתמשים: admin, director, duty1, duty2, duty3 · סיסמה: demo1234
          </p>
        ) : null}
      </div>
    </div>
  );
}
