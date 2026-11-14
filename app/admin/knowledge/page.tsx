import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { KnowledgeManager, type KnowledgeDoc } from "@/components/admin/knowledge-manager";
import { requireAdmin } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { MAX_TOTAL_CHARS } from "@/lib/ai/extract";

export const metadata: Metadata = { title: "מאגר הידע של העוזר" };

export default async function KnowledgePage() {
  await requireAdmin();
  let docs: KnowledgeDoc[] = [];
  if (!isDemoMode()) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("ai_documents")
      .select("id, title, source_name, content, active, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(`ai_documents: ${error.message}`);
    docs = data.map((d) => ({
      id: d.id,
      title: d.title,
      sourceName: d.source_name,
      chars: d.content.length,
      active: d.active,
      createdAt: d.created_at,
    }));
  }
  const total = docs.filter((d) => d.active).reduce((n, d) => n + d.chars, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="מאגר הידע של העוזר"
        description="העוזר עונה רק לפי אוגדן הנהלים, הלומדה, מה שמוזן באפליקציה והמסמכים שכאן. מה שלא נמצא באחד מהם, הוא עונה שאין לו מידע."
      />
      <KnowledgeManager docs={docs} totalChars={total} maxChars={MAX_TOTAL_CHARS} />
    </div>
  );
}
