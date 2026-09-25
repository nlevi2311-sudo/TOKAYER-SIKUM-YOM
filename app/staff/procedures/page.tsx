import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ResourceBrowser } from "@/components/staff/resource-browser";
import { getCategories, getResources } from "@/lib/data/staff";

export const metadata: Metadata = { title: "נהלים" };

export default async function ProceduresPage({ searchParams }: PageProps<"/staff/procedures">) {
  const { category } = await searchParams;
  const [resources, categories] = await Promise.all([
    getResources({ types: ["procedure"] }),
    getCategories("procedures"),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="ספר הנהלים"
        title="נהלים"
        description="כל הנהלים לפי נושא. הנוסח המלא נפתח במקור, כך שתמיד רואים את הגרסה העדכנית."
        breadcrumbs={[{ label: "בית", href: "/staff" }, { label: "נהלים" }]}
      />
      <ResourceBrowser
        mode="procedures"
        resources={resources}
        categories={categories}
        initialCategory={typeof category === "string" ? category : ""}
      />
    </div>
  );
}
