import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ContactsBrowser } from "@/components/staff/contacts-browser";
import { getContacts } from "@/lib/data/staff";

export const metadata: Metadata = { title: "אנשי קשר" };

export default async function ContactsPage() {
  const contacts = await getContacts();
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="צוות"
        title="אנשי קשר"
        description="טלפונים ומיילים של אנשי הצוות. לחיצה על המספר מחייגת."
        breadcrumbs={[{ label: "בית", href: "/staff" }, { label: "אנשי קשר" }]}
      />
      <ContactsBrowser contacts={contacts} />
    </div>
  );
}
