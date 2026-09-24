import Link from "next/link";
import AppShell from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getMode, usersWithDemoPassword } from "@/lib/settings";
import ImportClient from "./ImportClient";

export const dynamic = "force-dynamic";

export default async function ImportPage() {
  const user = await requireUser(["ADMIN"]);
  const [mode, blockers, childCount] = await Promise.all([getMode(), usersWithDemoPassword(), db.child.count()]);
  return (
    <AppShell user={user} title="ייבוא ילדים מאקסל" back="/children">
      <div className="mx-auto max-w-3xl space-y-3">
        <div className="card space-y-1 text-sm">
          <p>
            הקובץ נקרא כאן בדפדפן ונשמר ישירות בבסיס הנתונים של המערכת. הוא לא עובר דרך שום מקום אחר.
          </p>
          <p className="text-slate-600">מומלץ להסתפק בשם, ביתן ומה שבאמת נדרש לעבודת המנהל התורן. מידע רפואי מפורט לא צריך להיות כאן.</p>
        </div>
        {blockers.length ? (
          <div className="card space-y-2 ring-2 ring-bad">
            <h2 className="h2 text-bad">קודם מחליפים סיסמאות</h2>
            <p className="text-sm">
              כל עוד יש משתמש עם סיסמת הדמה, כל מי שיש לו את הקישור יכול להיכנס. לכן הייבוא חסום עד שכל הסיסמאות יוחלפו או שהמשתמש יושבת.
            </p>
            <ul className="list-inside list-disc text-sm font-semibold">
              {blockers.map((b) => (
                <li key={b.id}>
                  {b.fullName} (<span dir="ltr">{b.username}</span>)
                </li>
              ))}
            </ul>
            <Link href="/admin/users" className="btn-primary">
              לניהול משתמשים
            </Link>
          </div>
        ) : null}
        <ImportClient disabled={blockers.length > 0} isDemo={mode === "demo"} childCount={childCount} />
      </div>
    </AppShell>
  );
}
