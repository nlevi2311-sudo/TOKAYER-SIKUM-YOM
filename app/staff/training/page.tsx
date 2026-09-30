import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { TrainingBrowser } from "@/components/staff/training-browser";
import { getCategories, getTrainingItems } from "@/lib/data/staff";

export const metadata: Metadata = { title: "הדרכות" };

export default async function TrainingPage({ searchParams }: PageProps<"/staff/training">) {
  const { category } = await searchParams;
  const [items, categories] = await Promise.all([getTrainingItems(), getCategories("training")]);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="למידה והכשרה"
        title="הדרכות"
        description="מצגות, סרטונים, קבצים ותקצירים. הכשרות החובה מסומנות."
        breadcrumbs={[{ label: "בית", href: "/staff" }, { label: "הדרכות" }]}
      />
      <TrainingBrowser items={items} categories={categories} initialCategory={typeof category === "string" ? category : ""} />
    </div>
  );
}
