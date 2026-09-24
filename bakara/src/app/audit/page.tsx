import Link from "next/link";
import AppShell from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { fmtDateTime } from "@/lib/time";
import { STATUS_LABELS, type CheckStatus } from "@/lib/checks";

export const dynamic = "force-dynamic";

const ACTIONS: Record<string, string> = {
  LOGIN: "כניסה",
  LOGIN_FAILED: "כניסה נכשלה",
  LOGOUT: "יציאה",
  LOGOUT_IDLE: "יציאה אוטומטית",
  SHIFT_OPEN: "פתיחת משמרת",
  SHIFT_CLOSE: "סגירת משמרת",
  SHIFT_CLOSE_BLOCKED: "ניסיון סגירה נחסם",
  CHECK_SET: "סימון בדיקה",
  CHECK_UPDATE: "שינוי בדיקה",
  CHECK_CLEAR: "ביטול בדיקה",
  EXCEPTION_OPEN: "פתיחת חריגה",
  EXCEPTION_UPDATE: "התייחסות לחריגה",
  EXCEPTION_CLOSE: "סגירת חריגה",
  INCIDENT_OPEN: "פתיחת אירוע חריג",
  CHILD_CREATE: "הוספת ילד",
  CHILD_UPDATE: "עדכון ילד",
  CHILD_PRESENCE: "שינוי נוכחות",
  USER_CREATE: "יצירת משתמש",
  USER_UPDATE: "עדכון משתמש",
  SEED: "טעינת נתוני דמה",
};

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const user = await requireUser(["ADMIN", "DIRECTOR"]);
  const page = Math.max(0, Number((await searchParams).page ?? 0) || 0);
  const logs = await db.auditLog.findMany({ orderBy: { createdAt: "desc" }, include: { user: true }, skip: page * 100, take: 100 });
  return (
    <AppShell user={user} title="יומן פעולות">
      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>מתי</th>
              <th>מי</th>
              <th>פעולה</th>
              <th>פרטים</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td className="whitespace-nowrap">{fmtDateTime(l.createdAt)}</td>
                <td className="whitespace-nowrap">{l.user?.fullName ?? "—"}</td>
                <td className="whitespace-nowrap font-semibold">{ACTIONS[l.action] ?? l.action}</td>
                <td className="max-w-md truncate text-xs text-slate-500" title={l.details}>
                  {describe(l.details)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 flex gap-2">
          {page > 0 ? (
            <Link href={`/audit?page=${page - 1}`} className="btn-secondary">
              חדשים יותר
            </Link>
          ) : null}
          {logs.length === 100 ? (
            <Link href={`/audit?page=${page + 1}`} className="btn-secondary">
              ישנים יותר
            </Link>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}

function describe(details: string) {
  try {
    const d = JSON.parse(details);
    const parts: string[] = [];
    if (d.child) parts.push(d.child);
    if (d.item) parts.push(d.item);
    if (d.to?.status) parts.push(`→ ${STATUS_LABELS[d.to.status as CheckStatus] ?? d.to.status}`);
    if (d.text) parts.push(d.text);
    if (d.note) parts.push(d.note);
    return parts.length ? parts.join(" · ") : details === "{}" ? "" : details;
  } catch {
    return details;
  }
}
