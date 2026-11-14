import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpLeft, BookOpen } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/page-header";
import { LomdaSetup } from "@/components/staff/lomda/lomda-setup";
import { LomdaProgressBar } from "@/components/staff/lomda/progress-bar";
import { Button } from "@/components/ui/button";
import { requireStaff } from "@/lib/auth/session";
import { BITANS, TRACKS, getTrack, getUnits, isUnitDone, summarize } from "@/lib/content/lomda";
import type { Unit } from "@/lib/content/lomda-types";
import { getLomdaState } from "@/lib/data/lomda";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "לומדת קליטה" };

function UnitRow({ unit, n, done }: { unit: Unit; n: number; done: boolean }) {
  return (
    <li>
      <Link
        href={`/staff/lomda/${unit.id}`}
        className="grid grid-cols-[2.25rem_1fr_auto] items-center gap-3 rounded-2xl border bg-card p-3.5 transition hover:border-primary"
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-surface font-bold tabular-nums text-primary">{n}</span>
        <span className="min-w-0">
          <span className="block font-semibold leading-snug">{unit.title}</span>
          <span className="block text-sm text-muted-foreground">{unit.subtitle}</span>
        </span>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-bold",
            done ? "bg-mint/20 text-primary" : "bg-highlight/15 text-foreground",
          )}
        >
          {done ? "הושלם" : "פתוח"}
        </span>
      </Link>
    </li>
  );
}

export default async function LomdaPage() {
  const user = await requireStaff("/staff/lomda");
  const state = await getLomdaState(user);
  const { core, trackUnits } = getUnits(state.track, state.bitan);
  const s = summarize(state);
  const all = [...core, ...trackUnits];
  const next = all.find((u) => !isUnitDone(u, state));

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "בית", href: "/staff" }, { label: "לומדת קליטה" }]} />
      <header className="relative overflow-hidden rounded-3xl bg-brand-gradient p-6 text-white sm:p-8">
        <div className="relative max-w-2xl space-y-2">
          <p className="text-sm font-bold text-highlight">קליטת עובד חדש · תשפ״ז</p>
          <h1 className="text-3xl font-extrabold sm:text-4xl">לומדת קליטה, {user.firstName}</h1>
          <p className="text-white/85">
            לפני המשמרת הראשונה צריך לדעת שלושה דברים: מי הילדים שלנו, איך עובדים כאן, ובמה אסור לטעות. בוחרים תפקיד וביתן,
            והלומדה מתאימה את עצמה. בסוף כל יחידה יש מצבים מהשטח.
          </p>
        </div>
      </header>

      <p className="rounded-xl border-s-4 border-highlight bg-highlight/10 px-4 py-3 text-sm">
        הלומדה היא חומר היכרות. היא לא מחליפה את אוגדן הנהלים, את החפיפה בשטח או הנחיה של מנהל. המצבים בשאלות מורכבים מכמה מקרים
        ואינם מתארים ילד מסוים.
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <LomdaSetup
            tracks={TRACKS.map((t) => ({ key: t.key, label: t.label, description: t.description }))}
            bitans={BITANS.map((b) => ({ key: b.key, name: b.name, color: b.color }))}
            track={state.track}
            bitan={state.bitan}
          />

          <section className="space-y-3" aria-label="תוכן העניינים">
            <h2 className="text-xl font-bold text-primary">תוכן העניינים</h2>
            <p className="text-sm font-bold text-muted-foreground">יחידות הליבה, לכל עובד</p>
            <ol className="space-y-2">
              {core.map((u, i) => (
                <UnitRow key={u.id} unit={u} n={i + 1} done={isUnitDone(u, state)} />
              ))}
            </ol>
            {state.track ? (
              <>
                <p className="pt-2 text-sm font-bold text-muted-foreground">המסלול שלך: {getTrack(state.track).label}</p>
                <ol className="space-y-2">
                  {trackUnits.map((u, i) => (
                    <UnitRow key={u.id} unit={u} n={core.length + i + 1} done={isUnitDone(u, state)} />
                  ))}
                </ol>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">יחידות המסלול ייפתחו אחרי שתבחר תפקיד.</p>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <LomdaProgressBar done={s.unitsDone} total={s.unitsTotal} label="ההתקדמות שלך" />
          <div className="flex flex-col gap-2">
            {next ? (
              <Button asChild size="lg">
                <Link href={`/staff/lomda/${next.id}`}>{s.unitsDone ? "להמשיך מאיפה שעצרתי" : "להתחיל"}</Link>
              </Button>
            ) : null}
            {state.track ? (
              <Button asChild size="lg" variant={s.allDone ? "default" : "outline"}>
                <Link href="/staff/lomda/finish">{state.completedAt ? "האישור שלי" : "לסיום ולאישור"}</Link>
              </Button>
            ) : null}
          </div>
          <Link
            href="/staff/ogdan"
            className="flex items-center gap-3 rounded-2xl border border-primary/40 bg-card p-4 transition hover:border-primary"
          >
            <BookOpen className="size-5 shrink-0 text-primary" />
            <span className="flex-1">
              <span className="block font-bold">האוגדן בכיס</span>
              <span className="block text-sm text-muted-foreground">כל 86 הנהלים, עם חיפוש. גם באמצע משמרת.</span>
            </span>
            <ArrowUpLeft className="size-4 text-primary" />
          </Link>
        </aside>
      </div>
    </div>
  );
}
