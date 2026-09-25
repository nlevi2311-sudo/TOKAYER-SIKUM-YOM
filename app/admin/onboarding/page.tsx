import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { OnboardingManager } from "@/components/admin/onboarding/onboarding-manager";
import { RESOURCE_TYPE_PLURALS } from "@/components/admin/utils";
import { getOnboardingItems, getResources, getTrainingItems } from "@/lib/data/staff";
import { RESOURCE_TYPES } from "@/lib/labels";

export const metadata: Metadata = { title: "מסלול קליטה" };

export default async function AdminOnboardingPage() {
  const [items, resources, training] = await Promise.all([getOnboardingItems(), getResources(), getTrainingItems()]);

  const resourceOptions = RESOURCE_TYPES.flatMap((type) =>
    resources
      .filter((r) => r.type === type)
      .map((r) => ({ value: r.id, label: r.title, group: RESOURCE_TYPE_PLURALS[type] })),
  );
  const trainingOptions = training.map((t) => ({ value: t.id, label: t.title }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="תוכן לצוות"
        title="מסלול קליטה"
        description="מה עובד חדש צריך לעשות, לקרוא ולהכיר, לפי שלבים. כל פריט יכול להוביל למשאב, להדרכה או לכתובת."
        breadcrumbs={[{ label: "ממשק ניהול", href: "/admin" }, { label: "מסלול קליטה" }]}
      />
      <OnboardingManager
        items={items}
        resourceOptions={resourceOptions}
        trainingOptions={trainingOptions}
      />
    </div>
  );
}
