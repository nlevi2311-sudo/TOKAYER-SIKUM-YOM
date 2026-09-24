import AppShell from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import UserForm from "./UserForm";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const user = await requireUser(["ADMIN"]);
  const users = await db.user.findMany({ orderBy: [{ role: "asc" }, { fullName: "asc" }] });
  return (
    <AppShell user={user} title="ניהול משתמשים">
      <div className="space-y-4">
        <div className="card">
          <h2 className="h2 mb-2">משתמש חדש</h2>
          <UserForm />
        </div>
        {users.map((u) => (
          <div key={u.id} className={`card ${u.active ? "" : "opacity-60"}`}>
            <UserForm user={{ id: u.id, username: u.username, fullName: u.fullName, role: u.role, active: u.active }} />
          </div>
        ))}
      </div>
    </AppShell>
  );
}
