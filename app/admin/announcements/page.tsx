import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import {
  AnnouncementsManager,
  type AnnouncementStatus,
} from "@/components/admin/announcements/announcements-manager";
import { getAllAnnouncements } from "@/lib/data/admin";

export const metadata: Metadata = { title: "הודעות ועדכונים" };

export default async function AdminAnnouncementsPage({ searchParams }: PageProps<"/admin/announcements">) {
  const params = await searchParams;
  const announcements = await getAllAnnouncements();
  const now = new Date().toISOString();
  const withStatus = announcements.map((a) => {
    const status: AnnouncementStatus =
      a.published_at > now ? "scheduled" : a.expires_at && a.expires_at <= now ? "expired" : "active";
    return { ...a, status };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="תוכן לצוות"
        title="הודעות ועדכונים"
        description="עדכונים שמופיעים לצוות בדף הבית ובלוח ההודעות. אפשר לתזמן פרסום והסרה."
        breadcrumbs={[{ label: "ממשק ניהול", href: "/admin" }, { label: "הודעות ועדכונים" }]}
      />
      <AnnouncementsManager key={String(params.new)} announcements={withStatus} openNew={params.new === "1"} />
    </div>
  );
}
