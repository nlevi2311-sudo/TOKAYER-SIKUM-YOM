import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ResourceCard } from "@/components/staff/resource-card";
import { TrainingCard } from "@/components/staff/training-card";
import { getFavorites } from "@/lib/data/staff";

export const metadata: Metadata = { title: "המועדפים שלי" };

export default async function FavoritesPage() {
  const { resources, training } = await getFavorites();
  const empty = resources.length === 0 && training.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="שלי"
        title="המועדפים שלי"
        description="מה שסימנת בכוכב. אפשר להסיר בלחיצה על הכוכב."
        breadcrumbs={[{ label: "בית", href: "/staff" }, { label: "המועדפים שלי" }]}
      />
      {empty ? (
        <EmptyState
          icon="star"
          title="עדיין אין מועדפים"
          description="בכל נוהל, טופס, מערכת או הדרכה יש כוכב. לחיצה עליו מוסיפה את הפריט לכאן ולדף הבית."
          action={
            <Link href="/staff/procedures" className="text-sm font-semibold text-primary hover:underline">
              לנהלים
            </Link>
          }
        />
      ) : (
        <>
          {resources.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {resources.map((r) => (
                <li key={r.id}>
                  <ResourceCard resource={r} showType />
                </li>
              ))}
            </ul>
          ) : null}
          {training.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-primary">הדרכות</h2>
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {training.map((t) => (
                  <li key={t.id}>
                    <TrainingCard item={t} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
