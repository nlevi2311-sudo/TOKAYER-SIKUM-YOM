import Link from "next/link";
import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { shiftLabel } from "@/lib/checks";
import { shiftCloseIssues } from "@/lib/engine";
import { getMyOpenShift } from "@/lib/shift";
import { closeShiftAction } from "@/app/actions/shift";

export const dynamic = "force-dynamic";

export default async function CloseShiftPage({ searchParams }: { searchParams: Promise<{ blocked?: string }> }) {
  const user = await requireUser(["DUTY", "ADMIN"]);
  const shift = await getMyOpenShift(user.id);
  if (!shift) redirect("/shift");
  const { blocked } = await searchParams;
  const issues = await shiftCloseIssues(shift);

  return (
    <AppShell user={user} title={`סיום משמרת ${shiftLabel(shift.type)}`} back="/shift">
      <div className="mx-auto max-w-2xl space-y-4">
        {issues.total ? (
          <>
            <div className="rounded-2xl bg-bad p-4 text-white">
              <div className="text-xl font-bold">אי אפשר לסגור את המשמרת</div>
              <div className="mt-1">
                {blocked ? "הניסיון לסגור נחסם. " : ""}
                יש {issues.total} דברים פתוחים. כל אחד מהם מחכה לך.
              </div>
            </div>

            <IssueBlock title="ילדים שלא נבדקו בכלל" count={issues.uncheckedChildren.length}>
              {issues.uncheckedChildren.map((c) => (
                <Row key={c.id} href={`/shift/child/${c.id}`} title={c.name} />
              ))}
            </IssueBlock>
            <IssueBlock title="בדיקות חובה שלא מולאו" count={issues.missingItems.length}>
              {issues.missingItems.map((c) => (
                <Row key={c.id} href={`/shift/child/${c.id}`} title={c.name} sub={c.items.join(", ")} />
              ))}
            </IssueBlock>
            <IssueBlock title="חריגות פתוחות שלא קיבלו התייחסות במשמרת הזו" count={issues.unaddressed.length}>
              {issues.unaddressed.map((e) => (
                <Row key={e.id} href={`/exceptions/${e.id}`} title={e.name} sub={e.item} />
              ))}
            </IssueBlock>
            <IssueBlock title="חריגות במעקב שהגיע זמן הבדיקה החוזרת שלהן" count={issues.recheckDue.length}>
              {issues.recheckDue.map((e) => (
                <Row key={e.id} href={`/exceptions/${e.id}`} title={e.name} sub={e.item} />
              ))}
            </IssueBlock>
            <IssueBlock title="אירועים חריגים מהמשמרת שלא נסגרו ולא הועברו למעקב" count={issues.openIncidents.length}>
              {issues.openIncidents.map((e) => (
                <Row key={e.id} href={`/exceptions/${e.id}`} title={e.name} sub="אירוע חריג" />
              ))}
            </IssueBlock>
          </>
        ) : (
          <form action={closeShiftAction} className="card space-y-4">
            <div className="rounded-xl bg-ok-bg p-3 font-bold text-ok">כל הבדיקות הושלמו. אפשר לסגור את המשמרת.</div>
            <div>
              <label className="label" htmlFor="handoffNotes">
                הערות למנהל התורן הבא
              </label>
              <textarea id="handoffNotes" name="handoffNotes" className="input min-h-28" placeholder="מה חשוב שהבא ידע" />
            </div>
            <div>
              <label className="label" htmlFor="nextTasks">
                משימות להמשך
              </label>
              <textarea id="nextTasks" name="nextTasks" className="input min-h-20" placeholder="מה צריך לקרות במשמרת הבאה" />
            </div>
            <button className="btn-primary w-full text-lg">סגירת משמרת והפקת סיכום</button>
          </form>
        )}
      </div>
    </AppShell>
  );
}

function IssueBlock({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  if (!count) return null;
  return (
    <div className="card">
      <h2 className="h2 mb-2 text-bad">
        {title} ({count})
      </h2>
      <ul className="divide-y divide-slate-100">{children}</ul>
    </div>
  );
}

function Row({ href, title, sub }: { href: string; title: string; sub?: string }) {
  return (
    <li>
      <Link href={href} className="flex items-center justify-between gap-2 py-3">
        <div>
          <div className="font-bold">{title}</div>
          {sub ? <div className="text-sm text-slate-600">{sub}</div> : null}
        </div>
        <span className="text-2xl text-slate-400">‹</span>
      </Link>
    </li>
  );
}
