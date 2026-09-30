import type { Metadata } from "next";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { AnnouncementCard } from "@/components/staff/announcement-card";
import { UpdatesFilter } from "@/components/staff/updates-filter";
import { getAnnouncements } from "@/lib/data/staff";

export const metadata: Metadata = { title: "עדכונים" };

export default async function UpdatesPage() {
  const items = await getAnnouncements({ limit: 100 });
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="מה חדש"
        title="עדכונים"
        description="נהלים חדשים, עדכוני הנהלה, הדרכות, פעילויות והודעות תפעוליות."
        breadcrumbs={[{ label: "בית", href: "/staff" }, { label: "עדכונים" }]}
      />
      {items.length === 0 ? (
        <EmptyState icon="megaphone" title="אין עדכונים כרגע" />
      ) : (
        <UpdatesFilter items={items}>
          {items.map((a) => (
            <AnnouncementCard key={a.id} item={a} />
          ))}
        </UpdatesFilter>
      )}
    </div>
  );
}
