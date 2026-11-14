import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth/session";
import { BITANS, getTrack } from "@/lib/content/lomda";
import { getLomdaReport, type LomdaReportRow } from "@/lib/data/lomda";

export const metadata: Metadata = { title: "לומדת קליטה" };

function status(r: LomdaReportRow): { label: string; variant: "default" | "secondary" | "outline" } {
  if (r.completedAt) return { label: "סיים", variant: "default" };
  if (r.track) return { label: "בתהליך", variant: "secondary" };
  return { label: "לא התחיל", variant: "outline" };
}

const date = (v: string | null) => (v ? new Date(v).toLocaleDateString("he-IL") : "");

export default async function AdminLomdaPage() {
  const admin = await requireAdmin();
  const rows = await getLomdaReport(admin);
  const finished = rows.filter((r) => r.completedAt).length;
  const inProgress = rows.filter((r) => !r.completedAt && r.track).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="לומדת קליטה"
        description="מי מהצוות סיים את הלומדה, מי באמצע ומי עוד לא התחיל. הציון הוא תשובות נכונות בניסיון ראשון."
      />
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "סיימו", value: finished },
          { label: "בתהליך", value: inProgress },
          { label: "לא התחילו", value: rows.length - finished - inProgress },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">{k.label}</p>
            <p className="text-3xl font-extrabold tabular-nums text-primary">{k.value}</p>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>עובד</TableHead>
              <TableHead>מסלול</TableHead>
              <TableHead>ביתן</TableHead>
              <TableHead>יחידות</TableHead>
              <TableHead>ניסיון ראשון</TableHead>
              <TableHead>סטטוס</TableHead>
              <TableHead>תאריך סיום</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const st = status(r);
              return (
                <TableRow key={r.userId}>
                  <TableCell>
                    <span className="block font-medium">{r.name}</span>
                    <span className="block text-xs text-muted-foreground" dir="ltr">
                      {r.email}
                    </span>
                  </TableCell>
                  <TableCell>{r.track ? getTrack(r.track).label : ""}</TableCell>
                  <TableCell>{BITANS.find((b) => b.key === r.bitan)?.name ?? ""}</TableCell>
                  <TableCell className="tabular-nums">{r.track && r.unitsTotal ? `${r.unitsDone}/${r.unitsTotal}` : ""}</TableCell>
                  <TableCell className="tabular-nums">
                    {r.questionsTotal && r.firstCorrect ? `${r.firstCorrect}/${r.questionsTotal}` : ""}
                  </TableCell>
                  <TableCell>
                    <Badge variant={st.variant}>{st.label}</Badge>
                  </TableCell>
                  <TableCell className="tabular-nums">{date(r.completedAt)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
