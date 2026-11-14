"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertAdmin, AuthError } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types";

const idSchema = z.object({ id: z.uuid() });

function fail(e: unknown, ctx: string): { ok: false; error: string } {
  if (e instanceof AuthError) return { ok: false, error: e.message };
  console.error(`[${ctx}]`, e);
  return { ok: false, error: "הפעולה נכשלה. נסו שוב." };
}

/** הפעלה או כיבוי של מסמך במאגר הידע */
export async function setKnowledgeActive(input: unknown): Promise<ActionResult<null>> {
  const parsed = idSchema.extend({ active: z.boolean() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "בקשה לא תקינה" };
  try {
    await assertAdmin();
    if (isDemoMode()) return { ok: false, error: "מצב הדגמה" };
    const supabase = await createClient();
    const { error } = await supabase.from("ai_documents").update({ active: parsed.data.active }).eq("id", parsed.data.id);
    if (error) throw error;
    revalidatePath("/admin/knowledge");
    return { ok: true, data: null };
  } catch (e) {
    return fail(e, "setKnowledgeActive");
  }
}

export async function deleteKnowledge(input: unknown): Promise<ActionResult<null>> {
  const parsed = idSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "בקשה לא תקינה" };
  try {
    await assertAdmin();
    if (isDemoMode()) return { ok: false, error: "מצב הדגמה" };
    const supabase = await createClient();
    const { error } = await supabase.from("ai_documents").delete().eq("id", parsed.data.id);
    if (error) throw error;
    revalidatePath("/admin/knowledge");
    return { ok: true, data: null };
  } catch (e) {
    return fail(e, "deleteKnowledge");
  }
}
