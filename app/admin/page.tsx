import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Plus, UserCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { IconBadge } from "@/components/shared/icon-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import { RESOURCE_TYPE_PLURALS } from "@/components/admin/utils";
import { getAllAnnouncements, getProfiles } from "@/lib/data/admin";
import { getContacts, getEmergencyProtocols, getOnboardingItems, getResources, getTrainingItems } from "@/lib/data/staff";
import { RESOURCE_TYPES, RESOURCE_TYPE_LABELS } from "@/lib/labels";
import { isPlaceholderUrl } from "@/lib/text";
import type { ResourceType } from "@/types";

export const metadata: Metadata = { title: "סקירה כללית" };

const TYPE_ICONS: Record<ResourceType, string> = {
  system: "monitor",
  procedure: "clipboard-list",
  form: "file-text",
  document: "folder-open",
  link: "link",
};

export default async function AdminOverviewPage() {
  const [resources, training, announcements, contacts, profiles, emergency, onboarding] = await Promise.all([
    getResources(),
    getTrainingItems(),
    getAllAnnouncements(),
    getContacts(),
    getProfiles(),
    getEmergencyProtocols(),
    getOnboardingItems(),
  ]);

  const now = new Date().toISOString();
  const activeAnnouncements = announcements.filter(
    (a) => a.published_at <= now && (!a.expires_at || a.expires_at > now),
  ).length;
  const pending = profiles.filter((p) => !p.active);
  const placeholders = resources.filter((r) => isPlaceholderUrl(r.url));
  const countByType = (t: ResourceType) => resources.filter((r) => r.type === t).length;

  const stats = [
    ...RESOURCE_TYPES.map((t) => ({
      label: RESOURCE_TYPE_PLURALS[t],
      value: countByType(t),
      href: `/admin/resources?type=${t}`,
      icon: TYPE_ICONS[t],
    })),
    { label: "הדרכות", value: training.length, href: "/admin/training", icon: "graduation-cap" },
    { label: "הודעות פעילות", value: activeAnnouncements, href: "/admin/announcements", icon: "megaphone" },
    { label: "אנשי קשר", value: contacts.length, href: "/admin/contacts", icon: "contact" },
  ];

  const shortcuts = [
    { label: "נוהל חדש", href: "/admin/resources?type=procedure&new=1" },
    { label: "טופס חדש", href: "/admin/resources?type=form&new=1" },
    { label: "הודעה לצוות", href: "/admin/announcements?new=1" },
    { label: "הדרכה חדשה", href: "/admin/training?new=1" },
  ];

  const sections = [
    { label: "מסך חירום", description: `${emergency.length} כרטיסי פעולה`, href: "/admin/emergency", icon: "siren", tone: "emergency" as const },
    { label: "מסלול קליטה", description: `${onboarding.length} פריטים לעובדים חדשים`, href: "/admin/onboarding", icon: "sprout", tone: "teal" as const },
    { label: "תוכן האתר הציבורי", description: "טקסטים, תמונות ופרטי קשר", href: "/admin/content", icon: "globe", tone: "teal" as const },
    { label: "משתמשים והרשאות", description: `${profiles.length} משתמשים רשומים`, href: "/admin/users", icon: "users", tone: "teal" as const },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="ממשק ניהול"
        title="סקירה כללית"
        description="כל התוכן של אזור הצוות והאתר הציבורי במקום אחד."
      />

      {pending.length > 0 ? (
        <Link
          href="/admin/users"
          className="flex items-center justify-between gap-3 rounded-2xl border border-warm/30 bg-warm-soft p-4 transition hover:border-warm/60"
        >
          <span className="flex items-center gap-3">
            <UserCheck className="size-5 text-warm" aria-hidden="true" />
            <span className="font-semibold">
              {pending.length === 1 ? "משתמש אחד ממתין לאישור" : `${pending.length} משתמשים ממתינים לאישור`}
            </span>
          </span>
          <span className="flex items-center gap-1 text-sm font-medium text-warm">
            לאישור
            <ArrowLeft className="size-4" aria-hidden="true" />
          </span>
        </Link>
      ) : null}

      <section aria-labelledby="stats-title" className="space-y-3">
        <h2 id="stats-title" className="sr-only">
          מספרים
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {stats.map((s) => (
            <li key={s.label}>
              <Link
                href={s.href}
                className="card-lift flex h-full items-center gap-3 rounded-2xl border bg-card p-4"
              >
                <IconBadge name={s.icon} size="sm" />
                <span className="min-w-0">
                  <span className="block text-2xl font-extrabold tabular-nums text-primary">{s.value}</span>
                  <span className="block truncate text-sm text-muted-foreground">{s.label}</span>
                </span>
              </Link>
            </li>
          ))}
          <li className="col-span-2 sm:col-span-1">
            <Link href="/admin/users" className="card-lift flex h-full items-center gap-3 rounded-2xl border bg-card p-4">
              <IconBadge name="user-plus" size="sm" tone={pending.length ? "warm" : "teal"} />
              <span className="min-w-0">
                <span className="block text-2xl font-extrabold tabular-nums text-primary">{pending.length}</span>
                <span className="block truncate text-sm text-muted-foreground">ממתינים לאישור</span>
              </span>
            </Link>
          </li>
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <section aria-labelledby="shortcuts-title" className="space-y-3 lg:col-span-2">
          <h2 id="shortcuts-title" className="text-lg font-bold">
            פעולות מהירות
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {shortcuts.map((s) => (
              <Button key={s.href} asChild variant="outline" className="h-11 justify-start rounded-xl bg-card">
                <Link href={s.href}>
                  <Plus className="text-warm" aria-hidden="true" />
                  {s.label}
                </Link>
              </Button>
            ))}
          </div>
          <ul className="space-y-2 pt-2">
            {sections.map((s) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  className="flex items-center gap-3 rounded-2xl border bg-card p-3 transition hover:border-primary/40"
                >
                  <IconBadge name={s.icon} tone={s.tone} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{s.label}</span>
                    <span className="block text-sm text-muted-foreground">{s.description}</span>
                  </span>
                  <ArrowLeft className="size-4 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="placeholders-title" className="space-y-3 lg:col-span-3">
          <div className="flex items-end justify-between gap-2">
            <div>
              <h2 id="placeholders-title" className="text-lg font-bold">
                קישורים שעדיין צריך לעדכן
              </h2>
              <p className="text-sm text-muted-foreground">פריטים שמצביעים לכתובת זמנית. עובדי הצוות רואים לידם תגית.</p>
            </div>
            {placeholders.length > 0 ? <StatusBadge tone="warning">{placeholders.length}</StatusBadge> : null}
          </div>
          {placeholders.length === 0 ? (
            <EmptyState icon="clipboard-check" title="כל הקישורים מעודכנים" description="אין פריטים עם כתובת זמנית." />
          ) : (
            <ul className="divide-y overflow-y-auto rounded-2xl border bg-card lg:max-h-[34rem]">
              {placeholders.map((r) => (
                <li key={r.id} className="flex items-center gap-3 px-4 py-3">
                  <IconBadge name={r.icon} fallback="link" size="sm" tone="muted" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{r.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {RESOURCE_TYPE_LABELS[r.type]}
                      {r.category ? ` · ${r.category.name}` : ""}
                    </p>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="text-primary">
                    <Link href={`/admin/resources?type=${r.type}&edit=${r.id}`} aria-label={`עדכון הקישור של ${r.title}`}>
                      עדכון
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
