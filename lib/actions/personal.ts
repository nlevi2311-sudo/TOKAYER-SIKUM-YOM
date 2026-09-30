"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertStaff, AuthError } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { toggleDemoFavorite } from "@/lib/demo/store";
import type { ActionResult } from "@/types";

const favoriteSchema = z.object({
  kind: z.enum(["resource", "training"]),
  id: z.uuid(),
});

/** מוסיף או מסיר מועדף. מחזיר את המצב החדש. */
export async function toggleFavorite(input: unknown): Promise<ActionResult<{ favorite: boolean }>> {
  const parsed = favoriteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "פריט לא תקין" };
  const { kind, id } = parsed.data;

  try {
    const user = await assertStaff();

    if (isDemoMode()) {
      const favorite = await toggleDemoFavorite(`${kind}:${id}`);
      revalidatePath("/staff", "layout");
      return { ok: true, data: { favorite } };
    }

    const supabase = await createClient();
    const column = kind === "resource" ? "resource_id" : "training_id";

    const { data: existing, error: readError } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq(column, id)
      .maybeSingle();
    if (readError) throw readError;

    if (existing) {
      const { error } = await supabase.from("favorites").delete().eq("id", existing.id);
      if (error) throw error;
      revalidatePath("/staff", "layout");
      return { ok: true, data: { favorite: false } };
    }

    const { error } = await supabase
      .from("favorites")
      .insert(kind === "resource" ? { user_id: user.id, resource_id: id } : { user_id: user.id, training_id: id });
    if (error) throw error;
    revalidatePath("/staff", "layout");
    return { ok: true, data: { favorite: true } };
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, error: e.message };
    console.error("[toggleFavorite]", e);
    return { ok: false, error: "לא הצלחנו לעדכן את המועדפים" };
  }
}
