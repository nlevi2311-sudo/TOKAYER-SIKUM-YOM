import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ContactsManager } from "@/components/admin/contacts/contacts-manager";
import { getContacts } from "@/lib/data/staff";

export const metadata: Metadata = { title: "אנשי קשר" };

export default async function AdminContactsPage() {
  const contacts = await getContacts();
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="תוכן לצוות"
        title="אנשי קשר"
        description="ספר הטלפונים של הצוות. אנשי קשר שמסומנים לחירום מופיעים גם במסך החירום."
        breadcrumbs={[{ label: "ממשק ניהול", href: "/admin" }, { label: "אנשי קשר" }]}
      />
      <ContactsManager contacts={contacts} />
    </div>
  );
}
