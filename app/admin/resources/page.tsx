import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ResourcesManager } from "@/components/admin/resources/resources-manager";
import { getAllCategories, getResources } from "@/lib/data/staff";
import { RESOURCE_TYPES } from "@/lib/labels";
import type { ResourceType } from "@/types";

export const metadata: Metadata = { title: "משאבים וקישורים" };

function single(value: string | string[] | undefined): string | null {
  return typeof value === "string" ? value : null;
}

export default async function AdminResourcesPage({ searchParams }: PageProps<"/admin/resources">) {
  const params = await searchParams;
  const typeParam = single(params.type);
  const initialType = RESOURCE_TYPES.includes(typeParam as ResourceType) ? (typeParam as ResourceType) : null;
  const [resources, categories] = await Promise.all([getResources(), getAllCategories()]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="תוכן לצוות"
        title="משאבים וקישורים"
        description="מערכות, נהלים, טפסים, מסמכים וקישורים שמופיעים באזור הצוות."
        breadcrumbs={[{ label: "ממשק ניהול", href: "/admin" }, { label: "משאבים וקישורים" }]}
      />
      <ResourcesManager
        key={`${typeParam}-${single(params.new)}-${single(params.edit)}`}
        resources={resources}
        categories={categories}
        initialType={initialType}
        openNew={single(params.new) === "1"}
        editId={single(params.edit)}
      />
    </div>
  );
}
