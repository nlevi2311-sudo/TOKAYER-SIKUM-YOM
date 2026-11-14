import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { FinishPanel } from "@/components/staff/lomda/finish-panel";
import { LomdaProgressBar } from "@/components/staff/lomda/progress-bar";
import { requireStaff } from "@/lib/auth/session";
import { checklistFor, getBitan, getTrack, summarize } from "@/lib/content/lomda";
import { getLomdaState } from "@/lib/data/lomda";

export const metadata: Metadata = { title: "סיום הלומדה" };

export default async function LomdaFinishPage() {
  const user = await requireStaff("/staff/lomda/finish");
  const state = await getLomdaState(user);
  if (!state.track) redirect("/staff/lomda");
  const s = summarize(state);
  const checklist = checklistFor(state.track);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        eyebrow="סיום"
        title="מהלומדה לשטח"
        description="הידע קיים. עכשיו סוגרים את מה שאפשר לסגור רק בכפר עצמו, מול הרכז שמלווה את החפיפה שלך."
        breadcrumbs={[
          { label: "בית", href: "/staff" },
          { label: "לומדת קליטה", href: "/staff/lomda" },
          { label: "סיום" },
        ]}
      />
      <LomdaProgressBar done={s.unitsDone} total={s.unitsTotal} label="יחידות שהושלמו" />
      {!s.allDone ? (
        <p className="rounded-xl border-s-4 border-highlight bg-highlight/10 px-4 py-3 text-sm">
          נשארו יחידות פתוחות. האישור ייפתח אחרי שכל היחידות יושלמו.
        </p>
      ) : null}
      <FinishPanel
        checklist={checklist}
        checked={checklist.map((_, i) => Boolean(state.checks[`${state.track}:${i}`]))}
        allDone={s.allDone}
        declared={state.declared}
        completedAt={state.completedAt}
        certificate={{
          name: user.fullName,
          track: getTrack(state.track).label,
          bitan: getBitan(state.bitan)?.name ?? null,
          firstCorrect: s.firstCorrect,
          questionsTotal: s.questionsTotal,
        }}
      />
    </div>
  );
}
