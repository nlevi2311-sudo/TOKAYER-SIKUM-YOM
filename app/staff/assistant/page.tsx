import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { AssistantChat } from "@/components/staff/assistant-chat";
import { requireStaff } from "@/lib/auth/session";

export const metadata: Metadata = { title: "העוזר של טוקאייר" };

export default async function AssistantPage() {
  const user = await requireStaff("/staff/assistant");
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        eyebrow="שאלות על נהלים ועבודה בכפר"
        title="העוזר של טוקאייר"
        description="שואלים מה עושים, מי מחליט ואת מי מעדכנים. התשובות מבוססות על אוגדן הנהלים תשפ״ז והלומדה."
        breadcrumbs={[{ label: "בית", href: "/staff" }, { label: "העוזר" }]}
      />
      <AssistantChat firstName={user.firstName} />
    </div>
  );
}
