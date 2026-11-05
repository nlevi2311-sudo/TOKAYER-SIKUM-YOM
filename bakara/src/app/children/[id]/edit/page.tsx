import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import ChildForm from "../../ChildForm";

export const dynamic = "force-dynamic";

export default async function EditChildPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(["ADMIN"]);
  const { id } = await params;
  const [child, units] = await Promise.all([db.child.findUnique({ where: { id } }), db.unit.findMany({ orderBy: { sortOrder: "asc" } })]);
  if (!child) notFound();
  return (
    <AppShell user={user} title={`עריכה: ${child.fullName}`} back={`/children/${id}`}>
      <div className="mx-auto max-w-xl">
        <ChildForm child={child} units={units} />
      </div>
    </AppShell>
  );
}
