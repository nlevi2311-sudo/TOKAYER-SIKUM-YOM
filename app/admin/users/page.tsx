import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { UsersManager } from "@/components/admin/users/users-manager";
import { requireAdmin } from "@/lib/auth/session";
import { getAllowlist, getProfiles } from "@/lib/data/admin";

export const metadata: Metadata = { title: "משתמשים והרשאות" };

export default async function AdminUsersPage() {
  const [user, profiles, allowlist] = await Promise.all([requireAdmin(), getProfiles(), getAllowlist()]);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="הרשאות"
        title="משתמשים והרשאות"
        description="אישור משתמשים חדשים, תפקידים ואישור אוטומטי לפי דומיין."
        breadcrumbs={[{ label: "ממשק ניהול", href: "/admin" }, { label: "משתמשים והרשאות" }]}
      />
      <UsersManager profiles={profiles} allowlist={allowlist} currentUserId={user.id} />
    </div>
  );
}
