import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { cleanText } from "@/components/admin/utils";
import { contentSections } from "@/config/public-content";
import { getPublicContentRows } from "@/lib/data/admin";
import { formatRelative } from "@/lib/text";

export const metadata: Metadata = { title: "תוכן האתר" };

export default async function AdminContentPage() {
  const rows = await getPublicContentRows();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="אתר ציבורי"
        title="תוכן האתר"
        description="הטקסטים, התמונות ופרטי הקשר באתר הציבורי. אזור שלא נערך מציג את תוכן ברירת המחדל."
        breadcrumbs={[{ label: "ממשק ניהול", href: "/admin" }, { label: "תוכן האתר" }]}
      />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {contentSections.map((s) => {
          const stored = rows[s.key];
          return (
            <li key={s.key} className="relative flex flex-col gap-3 rounded-2xl border bg-card p-5 transition hover:border-primary/40 hover:shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-bold">
                  <Link href={`/admin/content/${s.key}`} className="after:absolute after:inset-0 after:rounded-2xl">
                    {cleanText(s.title)}
                  </Link>
                </h2>
                <ArrowLeft className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </div>
              <p className="flex-1 text-sm text-muted-foreground">{cleanText(s.description)}</p>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
                {stored ? (
                  <span>עודכן לאחרונה {formatRelative(stored.updated_at)}</span>
                ) : (
                  <StatusBadge tone="muted">ברירת מחדל</StatusBadge>
                )}
                <Link
                  href={s.path}
                  target="_blank"
                  rel="noreferrer"
                  className="relative z-10 inline-flex items-center gap-1 rounded text-primary hover:underline"
                >
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                  צפייה באתר
                  <span className="sr-only">: {cleanText(s.title)} (נפתח בחלון חדש)</span>
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
