import AppShell from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { presentChildren } from "@/lib/engine";
import { getMyOpenShift } from "@/lib/shift";
import IncidentForm from "./IncidentForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewIncidentPage({ searchParams }: { searchParams: Promise<{ child?: string }> }) {
  const user = await requireUser(["DUTY", "ADMIN"]);
  const { child } = await searchParams;
  const shift = await getMyOpenShift(user.id);
  const children = await presentChildren();
  return (
    <AppShell user={user} title="אירוע חריג" back="/exceptions">
      <div className="mx-auto max-w-xl">
        {shift ? (
          <IncidentForm options={children.map((c) => ({ id: c.id, name: `${c.fullName} · ${c.unit.name}` }))} childId={child} />
        ) : (
          <div className="card space-y-3">
            <p>כדי לפתוח אירוע חריג צריך משמרת פתוחה.</p>
            <Link href="/shift" className="btn-primary">
              לפתיחת משמרת
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
