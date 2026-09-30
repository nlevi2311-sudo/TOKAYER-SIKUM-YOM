import { NextResponse, type NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { isDemoMode, isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { pushDemoRecent } from "@/lib/demo/store";
import { getResourceById, getTrainingItems, primaryTrainingUrl } from "@/lib/data/staff";

/**
 * פתיחת פריט: רושם אותו ב"אחרונים" ומפנה לכתובת המקורית (בדרך כלל Google Drive).
 * הפריט נטען דרך ה-RLS, כך שאי אפשר לפתוח פריט שאין לך הרשאה לראות.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/staff/open/[kind]/[id]">) {
  const { kind, id } = await ctx.params;

  if (!isSupabaseConfigured() && !isDemoMode()) return NextResponse.redirect(new URL("/setup", request.url));
  const user = await getSessionUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));
  if (!user.active) return NextResponse.redirect(new URL("/unauthorized", request.url));

  if (!/^[0-9a-f-]{36}$/i.test(id) || (kind !== "resource" && kind !== "training")) {
    return NextResponse.redirect(new URL("/staff?notfound=1", request.url));
  }

  let target: string | null = null;
  if (kind === "resource") {
    target = (await getResourceById(id))?.url ?? null;
  } else {
    const item = (await getTrainingItems()).find((t) => t.id === id);
    target = item ? (primaryTrainingUrl(item) ?? `/staff/training#${item.id}`) : null;
  }

  if (!target) return NextResponse.redirect(new URL("/staff?notfound=1", request.url));

  // רישום ב"אחרונים". כישלון כאן לא מונע את הפתיחה
  try {
    if (isDemoMode()) {
      await pushDemoRecent(kind === "resource" ? `resource:${id}` : `training:${id}`);
    } else {
      const supabase = await createClient();
      const column = kind === "resource" ? "resource_id" : "training_id";
      const { data: existing } = await supabase
        .from("recent_items")
        .select("id")
        .eq("user_id", user.id)
        .eq(column, id)
        .maybeSingle();
      if (existing) {
        await supabase.from("recent_items").update({ opened_at: new Date().toISOString() }).eq("id", existing.id);
      } else {
        await supabase
          .from("recent_items")
          .insert(kind === "resource" ? { user_id: user.id, resource_id: id } : { user_id: user.id, training_id: id });
      }
    }
  } catch (e) {
    console.error("[open] failed to record recent item", e);
  }

  const destination = target.startsWith("/") ? new URL(target, request.url) : new URL(target);
  if (!["http:", "https:", "mailto:", "tel:"].includes(destination.protocol)) {
    return NextResponse.redirect(new URL("/staff?notfound=1", request.url));
  }
  return NextResponse.redirect(destination, { status: 303 });
}
