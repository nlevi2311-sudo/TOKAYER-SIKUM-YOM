import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { MAX_DOC_CHARS, MAX_FILE_BYTES, MAX_TOTAL_CHARS, extractText } from "@/lib/ai/extract";

/**
 * הוספת מסמך למאגר הידע של העוזר (אדמין בלבד).
 * מקבל קובץ (Word, PDF, טקסט) או טקסט מודבק. נשמר רק הטקסט, לא הקובץ.
 */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user?.isAdmin) return Response.json({ error: "אין הרשאה" }, { status: 403 });
  if (isDemoMode()) return Response.json({ error: "מצב הדגמה: המסמך לא נשמר." }, { status: 400 });

  const form = await request.formData().catch(() => null);
  if (!form) return Response.json({ error: "בקשה לא תקינה" }, { status: 400 });

  const file = form.get("file");
  const pasted = String(form.get("text") ?? "").trim();
  let title = String(form.get("title") ?? "").trim().slice(0, 200);
  let content = pasted;
  let sourceName: string | null = null;

  try {
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_FILE_BYTES) return Response.json({ error: "הקובץ גדול מדי (עד 5MB)" }, { status: 400 });
      content = await extractText(file);
      sourceName = file.name;
      if (!title) title = file.name.replace(/\.[^.]+$/, "");
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "לא הצלחתי לקרוא את הקובץ";
    return Response.json({ error: msg }, { status: 400 });
  }

  if (!title) return Response.json({ error: "צריך כותרת למסמך" }, { status: 400 });
  if (!content) return Response.json({ error: "לא נמצא טקסט במסמך. אם זה PDF סרוק, צריך גרסה עם טקסט." }, { status: 400 });
  if (content.length > MAX_DOC_CHARS) {
    return Response.json({ error: `המסמך ארוך מדי (${content.length.toLocaleString("he-IL")} תווים, עד ${MAX_DOC_CHARS.toLocaleString("he-IL")}). כדאי לפצל אותו.` }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: existing, error: sumError } = await supabase.from("ai_documents").select("content").eq("active", true);
  if (sumError) return Response.json({ error: "לא הצלחתי לבדוק את גודל המאגר" }, { status: 500 });
  const total = existing.reduce((n, d) => n + d.content.length, 0);
  if (total + content.length > MAX_TOTAL_CHARS) {
    return Response.json({ error: "המאגר מלא. כבו או מחקו מסמך ישן לפני שמוסיפים חדש." }, { status: 400 });
  }

  const { error } = await supabase
    .from("ai_documents")
    .insert({ title, content, source_name: sourceName, created_by: user.id });
  if (error) {
    console.error("[knowledge upload]", error);
    return Response.json({ error: "לא הצלחתי לשמור את המסמך" }, { status: 500 });
  }

  revalidatePath("/admin/knowledge");
  return Response.json({ ok: true, chars: content.length });
}
