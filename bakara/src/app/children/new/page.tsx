import AppShell from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import ChildForm from "../ChildForm";

export const dynamic = "force-dynamic";

export default async function NewChildPage() {
  const user = await requireUser(["ADMIN"]);
  const units = await db.unit.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <AppShell user={user} title="ילד חדש" back="/children">
      <div className="mx-auto max-w-xl">
        <ChildForm units={units} />
      </div>
    </AppShell>
  );
}
