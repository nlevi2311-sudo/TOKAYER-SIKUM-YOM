import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpLeft } from "lucide-react";
import { PathMotif } from "@/components/brand/path-motif";
import { EmptyState } from "@/components/shared/empty-state";
import { IconBadge } from "@/components/shared/icon-badge";
import { Breadcrumbs } from "@/components/shared/page-header";
import { OnboardingTrack } from "@/components/staff/onboarding-track";
import { getOnboardingItems, type OnboardingEntry } from "@/lib/data/staff";
import { ONBOARDING_STAGE_LABELS } from "@/lib/labels";
import type { OnboardingStage } from "@/types";

export const metadata: Metadata = { title: "עובד חדש" };

const TRACK: OnboardingStage[] = ["day1", "week1", "month1"];
const SECTIONS: Array<{ stage: OnboardingStage; icon: string }> = [
  { stage: "must_read", icon: "book-open" },
  { stage: "people", icon: "users" },
  { stage: "systems", icon: "layout-grid" },
  { stage: "procedures", icon: "shield-check" },
  { stage: "trainings", icon: "graduation-cap" },
];

function SectionList({ items }: { items: OnboardingEntry[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id}>
          {item.href ? (
            <Link
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener" : undefined}
              prefetch={item.external ? false : undefined}
              className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition hover:bg-surface"
            >
              <span>
                <span className="block font-medium">{item.title}</span>
                {item.description ? <span className="block text-sm text-muted-foreground">{item.description}</span> : null}
              </span>
              <ArrowUpLeft className="size-4 shrink-0 text-primary" aria-hidden="true" />
            </Link>
          ) : (
            <div className="rounded-xl px-3 py-2.5">
              <span className="block font-medium">{item.title}</span>
              {item.description ? <span className="block text-sm text-muted-foreground">{item.description}</span> : null}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default async function OnboardingPage() {
  const items = await getOnboardingItems();
  const byStage = (stage: OnboardingStage) => items.filter((i) => i.stage === stage);
  const trackStages = TRACK.map((s) => ({ key: s, label: ONBOARDING_STAGE_LABELS[s], items: byStage(s) })).filter(
    (s) => s.items.length > 0,
  );

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: "בית", href: "/staff" }, { label: "עובד חדש" }]} />
      <header className="relative overflow-hidden rounded-3xl bg-brand-gradient p-6 text-white sm:p-10">
        <PathMotif tone="light" className="absolute -bottom-24 -start-20 size-80 opacity-80 sm:size-[26rem]" />
        <div className="relative max-w-xl space-y-2">
          <p className="text-sm font-bold text-highlight">מסלול קליטה</p>
          <h1 className="text-3xl font-extrabold sm:text-4xl">ברוכים הבאים לטוקאייר</h1>
          <p className="text-white/85">
            כאן מרוכז כל מה שצריך בחודש הראשון: מה עושים ביום הראשון, מה קוראים, את מי מכירים ולאילו מערכות נרשמים.
          </p>
        </div>
      </header>

      {items.length === 0 ? (
        <EmptyState icon="sparkles" title="מסלול הקליטה עדיין לא הוגדר" description="ההנהלה מגדירה אותו בממשק הניהול." />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section aria-label="מסלול הקליטה">
            {trackStages.length > 0 ? <OnboardingTrack stages={trackStages} /> : null}
          </section>
          <div className="space-y-4">
            {SECTIONS.map(({ stage, icon }) => {
              const list = byStage(stage);
              if (list.length === 0) return null;
              return (
                <section key={stage} className="rounded-2xl border bg-card p-4" aria-label={ONBOARDING_STAGE_LABELS[stage]}>
                  <h2 className="mb-2 flex items-center gap-2 font-bold">
                    <IconBadge name={icon} size="sm" />
                    {ONBOARDING_STAGE_LABELS[stage]}
                  </h2>
                  <SectionList items={list} />
                </section>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
