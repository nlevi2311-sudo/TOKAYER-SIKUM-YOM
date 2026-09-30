import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { EmergencyManager } from "@/components/admin/emergency/emergency-manager";
import { getEmergencyProtocols, getResources } from "@/lib/data/staff";

export const metadata: Metadata = { title: "מסך חירום" };

export default async function AdminEmergencyPage() {
  const [protocols, procedures] = await Promise.all([getEmergencyProtocols(), getResources({ types: ["procedure"] })]);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="תוכן לצוות"
        title="מסך חירום"
        description="כרטיסי פעולה קצרים למצבי חירום: מה עושים עכשיו, למי מתקשרים ומה לא עושים."
        breadcrumbs={[{ label: "ממשק ניהול", href: "/admin" }, { label: "מסך חירום" }]}
      />
      <EmergencyManager protocols={protocols} procedures={procedures.map((p) => ({ id: p.id, title: p.title }))} />
    </div>
  );
}
