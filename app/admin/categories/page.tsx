import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { CategoriesManager } from "@/components/admin/categories/categories-manager";
import { getAllCategories, getResources, getTrainingItems } from "@/lib/data/staff";

export const metadata: Metadata = { title: "קטגוריות" };

export default async function AdminCategoriesPage() {
  const [categories, resources, training] = await Promise.all([getAllCategories(), getResources(), getTrainingItems()]);
  const usage: Record<string, number> = {};
  for (const item of [...resources, ...training]) {
    if (item.category_id) usage[item.category_id] = (usage[item.category_id] ?? 0) + 1;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="תוכן לצוות"
        title="קטגוריות"
        description="הקטגוריות מארגנות את הנהלים, הטפסים, המערכות, המסמכים וההדרכות. הסדר כאן הוא הסדר שהצוות רואה."
        breadcrumbs={[{ label: "ממשק ניהול", href: "/admin" }, { label: "קטגוריות" }]}
      />
      <CategoriesManager categories={categories} usage={usage} />
    </div>
  );
}
