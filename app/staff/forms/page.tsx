import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ResourceBrowser } from "@/components/staff/resource-browser";
import { getCategories, getResources } from "@/lib/data/staff";

export const metadata: Metadata = { title: "טפסים" };

export default async function FormsPage({ searchParams }: PageProps<"/staff/forms">) {
  const { category } = await searchParams;
  const [resources, categories] = await Promise.all([
    getResources({ types: ["form"] }),
    getCategories("forms"),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="טפסים ודיווחים"
        title="טפסים"
        description="כל הטפסים במקום אחד. בוחרים קטגוריה או מחפשים לפי שם."
        breadcrumbs={[{ label: "בית", href: "/staff" }, { label: "טפסים" }]}
      />
      <ResourceBrowser
        mode="forms"
        resources={resources}
        categories={categories}
        initialCategory={typeof category === "string" ? category : ""}
      />
    </div>
  );
}
