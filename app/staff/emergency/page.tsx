import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { EmergencyPanel } from "@/components/staff/emergency-panel";
import { getEmergencyProtocols } from "@/lib/data/staff";

export const metadata: Metadata = { title: "חירום ונהלים מיידיים" };

export default async function EmergencyPage() {
  const protocols = await getEmergencyProtocols();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="חירום ונהלים מיידיים"
        description="הנחיות קצרות לרגע האמת. הנוסח המחייב נמצא בנוהל המלא."
        breadcrumbs={[{ label: "בית", href: "/staff" }, { label: "חירום" }]}
      />
      <EmergencyPanel protocols={protocols} />
    </div>
  );
}
