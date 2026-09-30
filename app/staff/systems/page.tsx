import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ResourceBrowser } from "@/components/staff/resource-browser";
import { getCategories, getResources } from "@/lib/data/staff";

export const metadata: Metadata = { title: "מערכות" };

export default async function SystemsPage({ searchParams }: PageProps<"/staff/systems">) {
  const { category } = await searchParams;
  const [resources, categories] = await Promise.all([
    getResources({ types: ["system"] }),
    getCategories("systems"),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="המערכות שלנו"
        title="מערכות"
        description="כניסה מהירה לכל המערכות שהצוות עובד איתן."
        breadcrumbs={[{ label: "בית", href: "/staff" }, { label: "מערכות" }]}
      />
      <ResourceBrowser
        mode="systems"
        resources={resources}
        categories={categories}
        initialCategory={typeof category === "string" ? category : ""}
      />
    </div>
  );
}
