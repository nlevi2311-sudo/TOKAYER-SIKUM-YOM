import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { ContentForm } from "@/components/admin/content/content-form";
import { cleanText } from "@/components/admin/utils";
import { contentSections, mergeContent } from "@/config/public-content";
import { getPublicContentRows } from "@/lib/data/admin";
import { formatRelative } from "@/lib/text";

function findSection(key: string) {
  return contentSections.find((s) => s.key === key);
}

export async function generateMetadata({ params }: PageProps<"/admin/content/[key]">): Promise<Metadata> {
  const { key } = await params;
  return { title: findSection(key)?.title ?? "תוכן האתר" };
}

export default async function AdminContentEditPage({ params }: PageProps<"/admin/content/[key]">) {
  const { key } = await params;
  const section = findSection(key);
  if (!section) notFound();

  const rows = await getPublicContentRows();
  const stored = rows[section.key];
  const value = mergeContent(section.key, stored?.value) as Record<string, unknown>;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="אתר ציבורי"
        title={cleanText(section.title)}
        description={cleanText(section.description)}
        breadcrumbs={[
          { label: "ממשק ניהול", href: "/admin" },
          { label: "תוכן האתר", href: "/admin/content" },
          { label: cleanText(section.title) },
        ]}
        actions={
          <Button asChild variant="outline">
            <Link href={section.path} target="_blank" rel="noreferrer">
              <ExternalLink aria-hidden="true" />
              צפייה באתר
              <span className="sr-only">(נפתח בחלון חדש)</span>
            </Link>
          </Button>
        }
      />
      <p className="text-sm text-muted-foreground">
        {stored ? `עודכן לאחרונה ${formatRelative(stored.updated_at)}.` : "מוצג כרגע תוכן ברירת המחדל."} השינויים מופיעים באתר מיד אחרי השמירה.
      </p>
      <ContentForm contentKey={section.key} fields={section.fields} initialValue={value} hasStored={Boolean(stored)} />
    </div>
  );
}
