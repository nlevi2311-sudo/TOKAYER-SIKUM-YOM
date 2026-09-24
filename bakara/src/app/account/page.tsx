import AppShell from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/checks";
import PasswordForm from "./PasswordForm";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <AppShell user={user} title="החשבון שלי">
      <div className="mx-auto max-w-md space-y-3">
        <div className="card">
          <div className="text-lg font-bold">{user.fullName}</div>
          <div className="muted">
            {ROLE_LABELS[user.role]} · שם משתמש: <span dir="ltr">{user.username}</span>
          </div>
        </div>
        <PasswordForm />
      </div>
    </AppShell>
  );
}
