import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/env";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: { default: "ממשק ניהול", template: "%s | ממשק ניהול" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireAdmin();
  return (
    <AdminShell user={{ fullName: user.fullName, email: user.email }} demo={isDemoMode()}>
      {children}
    </AdminShell>
  );
}
