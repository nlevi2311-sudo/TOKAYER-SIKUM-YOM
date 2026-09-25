import type { Metadata } from "next";
import { StaffShell } from "@/components/staff/staff-shell";
import { requireStaff } from "@/lib/auth/session";
import { getEmergencyProtocols } from "@/lib/data/staff";

export const metadata: Metadata = {
  title: { default: "אזור הצוות", template: "%s | אזור הצוות טוקאייר" },
  robots: { index: false, follow: false },
};

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  const emergencies = await getEmergencyProtocols();
  return (
    <StaffShell user={user} emergencies={emergencies}>
      {children}
    </StaffShell>
  );
}
