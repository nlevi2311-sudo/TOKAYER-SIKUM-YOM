import AppShell from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import UserForm from "./UserForm";
import ResetDemo from "./ResetDemo";
import { getMode, usersWithDemoPassword } from "@/lib/settings";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const user = await requireUser(["ADMIN"]);
  const [users, mode, demoPw] = await Promise.all([
    db.user.findMany({ orderBy: [{ role: "asc" }, { fullName: "asc" }] }),
    getMode(),
    usersWithDemoPassword(),
  ]);
  return (
    <AppShell user={user} title="ניהול משתמשים">
      <div className="space-y-4">
        {demoPw.length ? (
          <div className="rounded-2xl bg-warn-bg p-3 text-sm font-semibold text-warn">
            עם סיסמת הדמה: {demoPw.map((u) => u.username).join(", ")}. לפני שמכניסים נתונים אמיתיים מחליפים לכל אחד סיסמה (בשדה &quot;סיסמה חדשה&quot; ואז עדכון) או מבטלים את הסימון &quot;פעיל&quot;.
          </div>
        ) : null}
        <Link href="/admin/import" className="btn-secondary">
          ייבוא ילדים מאקסל
        </Link>
        <div className="card">
          <h2 className="h2 mb-2">משתמש חדש</h2>
          <UserForm />
        </div>
        {users.map((u) => (
          <div key={u.id} className={`card ${u.active ? "" : "opacity-60"}`}>
            <UserForm user={{ id: u.id, username: u.username, fullName: u.fullName, role: u.role, active: u.active }} />
          </div>
        ))}
        {mode === "demo" ? <ResetDemo /> : null}
      </div>
    </AppShell>
  );
}
