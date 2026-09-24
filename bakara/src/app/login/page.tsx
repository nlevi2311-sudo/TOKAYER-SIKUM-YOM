import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ idle?: string }> }) {
  if (await getCurrentUser()) redirect("/");
  const { idle } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="card w-full max-w-sm space-y-5 p-6">
        <div className="text-center">
          <div className="text-4xl">📋</div>
          <h1 className="h1 mt-2">מערכת בקרה למנהל תורן</h1>
          <p className="muted mt-1">כניסה אישית</p>
        </div>
        {idle ? (
          <div className="rounded-xl bg-warn-bg p-3 text-sm font-semibold text-warn">בוצעה יציאה אוטומטית בגלל חוסר פעילות</div>
        ) : null}
        <LoginForm />
        <p className="text-center text-xs text-slate-400">
          סביבת דמה. משתמשים: admin, director, duty1, duty2, duty3 · סיסמה: demo1234
        </p>
      </div>
    </div>
  );
}
