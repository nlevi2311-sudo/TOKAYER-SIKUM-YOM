import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { TrainingManager } from "@/components/admin/training/training-manager";
import { getCategories, getTrainingItems } from "@/lib/data/staff";

export const metadata: Metadata = { title: "הדרכות" };

export default async function AdminTrainingPage({ searchParams }: PageProps<"/admin/training">) {
  const params = await searchParams;
  const [items, categories] = await Promise.all([getTrainingItems(), getCategories("training")]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="תוכן לצוות"
        title="הדרכות"
        description="מצגות, סרטונים וחומרי הדרכה. הסדר כאן הוא הסדר שהצוות רואה."
        breadcrumbs={[{ label: "ממשק ניהול", href: "/admin" }, { label: "הדרכות" }]}
      />
      <TrainingManager key={String(params.new)} items={items} categories={categories} openNew={params.new === "1"} />
    </div>
  );
}
