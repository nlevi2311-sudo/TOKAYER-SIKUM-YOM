import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ResourceBrowser } from "@/components/staff/resource-browser";
import { getAllCategories, getResources } from "@/lib/data/staff";

export const metadata: Metadata = { title: "מרכז מסמכים" };

export default async function LibraryPage({ searchParams }: PageProps<"/staff/library">) {
  const { category } = await searchParams;
  const [all, categories] = await Promise.all([
    getResources({ types: ["document", "procedure", "form", "link"] }),
    getAllCategories(),
  ]);
  // קיצורי דרך פנימיים (למשל "נהלים") הם ניווט ולא מסמך
  const resources = all.filter((r) => !r.url.startsWith("/"));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="כל המסמכים"
        title="מרכז מסמכים"
        description="נהלים, טפסים ומסמכים במקום אחד. כל מסמך נפתח במקור שלו ב Google Drive, כך שתמיד רואים את הגרסה העדכנית."
        breadcrumbs={[{ label: "בית", href: "/staff" }, { label: "מרכז מסמכים" }]}
      />
      <ResourceBrowser
        mode="library"
        resources={resources}
        categories={categories}
        initialCategory={typeof category === "string" ? category : ""}
      />
    </div>
  );
}
