"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { assertAdmin, AuthError } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import {
  allowlistSchema,
  announcementSchema,
  categorySchema,
  contactSchema,
  deleteSchema,
  emergencySchema,
  emptyToNull,
  onboardingSchema,
  profileUpdateSchema,
  reorderSchema,
  resourceSchema,
  splitLines,
  splitList,
  trainingSchema,
  type ReorderableTable,
} from "@/lib/validations/admin";
import {
  mergeContent,
  publicContentSchemas,
  type PublicContentKey,
} from "@/config/public-content";
import type { ActionResult, AppRole, Database } from "@/types";

/**
 * כל הפעולות של ממשק הניהול.
 * כל פעולה: (1) בודקת בשרת שהמשתמש אדמין פעיל, (2) מאמתת קלט עם Zod,
 * (3) כותבת ל-Supabase בשם המשתמש, כך שגם ה-RLS בודק הרשאת אדמין.
 */

type Supabase = Awaited<ReturnType<typeof createClient>>;
type SupabaseLike = Supabase;

const DEMO_MESSAGE = "מצב הדגמה: השינויים לא נשמרים. חברו את Supabase כדי לשמור.";

function revalidateAll() {
  revalidatePath("/staff", "layout");
  revalidatePath("/admin", "layout");
}

function validationError(error: z.ZodError): ActionResult<never> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return { ok: false, error: "יש שדות שצריך לתקן", fieldErrors };
}

function dbError(error: { message: string; code?: string }): ActionResult<never> {
  if (error.code === "23505") return { ok: false, error: "כבר קיים פריט עם אותו מזהה" };
  if (error.code === "42501") return { ok: false, error: "אין הרשאה לביצוע הפעולה" };
  if (error.code === "23514") return { ok: false, error: "אחד הערכים לא עומד בכללי המערכת (למשל כתובת לא תקינה)" };
  console.error("[admin action]", error);
  return { ok: false, error: "השמירה נכשלה. נסו שוב." };
}

/** עוטף כל פעולה: בדיקת אדמין, מצב הדגמה ותפיסת שגיאות */
async function run<T>(
  fn: (ctx: { supabase: SupabaseLike; userId: string; userName: string }) => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  try {
    const user = await assertAdmin();
    if (isDemoMode()) return { ok: false, error: DEMO_MESSAGE };
    const supabase = await createClient();
    const result = await fn({ supabase, userId: user.id, userName: user.fullName });
    if (result.ok) revalidateAll();
    return result;
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, error: e.message };
    console.error("[admin action]", e);
    return { ok: false, error: "משהו השתבש. נסו שוב." };
  }
}

async function nextSortOrder(supabase: SupabaseLike, table: ReorderableTable): Promise<number> {
  const { data } = await supabase.from(table).select("sort_order").order("sort_order", { ascending: false }).limit(1);
  const max = data && data.length > 0 ? (data[0] as { sort_order: number }).sort_order : 0;
  return max + 10;
}

// ---------------------------------------------------------------------
// משאבים
// ---------------------------------------------------------------------
export async function saveResource(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = resourceSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const v = parsed.data;

  return run<{ id: string }>(async ({ supabase, userId }) => {
    const row: Database["public"]["Tables"]["resources"]["Insert"] = {
      title: v.title,
      description: emptyToNull(v.description),
      url: v.url,
      type: v.type,
      category_id: emptyToNull(v.category_id),
      icon: emptyToNull(v.icon),
      roles: v.roles as AppRole[],
      is_public: v.is_public,
      is_pinned: v.is_pinned,
      is_important: v.is_important,
      is_quick_access: v.is_quick_access,
      owner: emptyToNull(v.owner),
      doc_type: emptyToNull(v.doc_type),
      keywords: splitList(v.keywords),
      content_updated_at: emptyToNull(v.content_updated_at),
      drive_file_id: emptyToNull(v.drive_file_id),
    };

    if (v.id) {
      const { error } = await supabase.from("resources").update(row).eq("id", v.id);
      if (error) return dbError(error);
      return { ok: true, data: { id: v.id }, message: "הפריט עודכן" };
    }
    const { data, error } = await supabase
      .from("resources")
      .insert({ ...row, created_by: userId, sort_order: await nextSortOrder(supabase, "resources") })
      .select("id")
      .single();
    if (error) return dbError(error);
    return { ok: true, data: { id: data.id }, message: "הפריט נוסף" };
  });
}

export async function toggleResourceFlag(input: {
  id: string;
  flag: "is_pinned" | "is_important" | "is_quick_access" | "is_public";
  value: boolean;
}): Promise<ActionResult> {
  const flags = ["is_pinned", "is_important", "is_quick_access", "is_public"] as const;
  if (!flags.includes(input.flag) || typeof input.value !== "boolean") return { ok: false, error: "קלט לא תקין" };
  return run(async ({ supabase }) => {
    const patch: Database["public"]["Tables"]["resources"]["Update"] = {};
    patch[input.flag] = input.value;
    const { error } = await supabase.from("resources").update(patch).eq("id", input.id);
    if (error) return dbError(error);
    return { ok: true, message: "עודכן" };
  });
}

// ---------------------------------------------------------------------
// קטגוריות
// ---------------------------------------------------------------------
export async function saveCategory(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const v = parsed.data;

  return run<{ id: string }>(async ({ supabase }) => {
    const row = {
      section: v.section,
      slug: v.slug,
      name: v.name,
      description: emptyToNull(v.description),
      icon: emptyToNull(v.icon),
    };
    if (v.id) {
      const { error } = await supabase.from("categories").update(row).eq("id", v.id);
      if (error) return dbError(error);
      return { ok: true, data: { id: v.id }, message: "הקטגוריה עודכנה" };
    }
    const { data, error } = await supabase
      .from("categories")
      .insert({ ...row, sort_order: await nextSortOrder(supabase, "categories") })
      .select("id")
      .single();
    if (error) return dbError(error);
    return { ok: true, data: { id: data.id }, message: "הקטגוריה נוספה" };
  });
}

// ---------------------------------------------------------------------
// הודעות
// ---------------------------------------------------------------------
export async function saveAnnouncement(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = announcementSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const v = parsed.data;

  return run<{ id: string }>(async ({ supabase, userId, userName }) => {
    const row = {
      title: v.title,
      body: v.body,
      kind: v.kind,
      is_important: v.is_important,
      roles: v.roles as AppRole[],
      link_url: emptyToNull(v.link_url),
      published_at: v.published_at ? new Date(v.published_at).toISOString() : new Date().toISOString(),
      expires_at: v.expires_at ? new Date(v.expires_at).toISOString() : null,
    };
    if (v.id) {
      const { error } = await supabase.from("announcements").update(row).eq("id", v.id);
      if (error) return dbError(error);
      return { ok: true, data: { id: v.id }, message: "ההודעה עודכנה" };
    }
    const { data, error } = await supabase
      .from("announcements")
      .insert({ ...row, author_id: userId, author_name: userName })
      .select("id")
      .single();
    if (error) return dbError(error);
    return { ok: true, data: { id: data.id }, message: "ההודעה פורסמה" };
  });
}

export async function toggleAnnouncementImportant(input: { id: string; value: boolean }): Promise<ActionResult> {
  return run(async ({ supabase }) => {
    const { error } = await supabase
      .from("announcements")
      .update({ is_important: Boolean(input.value) })
      .eq("id", input.id);
    if (error) return dbError(error);
    return { ok: true, message: "עודכן" };
  });
}

// ---------------------------------------------------------------------
// אנשי קשר
// ---------------------------------------------------------------------
export async function saveContact(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const v = parsed.data;

  return run<{ id: string }>(async ({ supabase }) => {
    const row = {
      full_name: v.full_name,
      role_title: emptyToNull(v.role_title),
      responsibility: emptyToNull(v.responsibility),
      department: emptyToNull(v.department),
      phone: emptyToNull(v.phone),
      email: emptyToNull(v.email),
      is_emergency: v.is_emergency,
    };
    if (v.id) {
      const { error } = await supabase.from("contacts").update(row).eq("id", v.id);
      if (error) return dbError(error);
      return { ok: true, data: { id: v.id }, message: "איש הקשר עודכן" };
    }
    const { data, error } = await supabase
      .from("contacts")
      .insert({ ...row, sort_order: await nextSortOrder(supabase, "contacts") })
      .select("id")
      .single();
    if (error) return dbError(error);
    return { ok: true, data: { id: data.id }, message: "איש הקשר נוסף" };
  });
}

// ---------------------------------------------------------------------
// הדרכות
// ---------------------------------------------------------------------
export async function saveTraining(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = trainingSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const v = parsed.data;

  return run<{ id: string }>(async ({ supabase, userId }) => {
    const row = {
      title: v.title,
      summary: emptyToNull(v.summary),
      category_id: emptyToNull(v.category_id),
      file_url: emptyToNull(v.file_url),
      slides_url: emptyToNull(v.slides_url),
      video_url: emptyToNull(v.video_url),
      link_url: emptyToNull(v.link_url),
      duration_minutes: v.duration_minutes ? Number(v.duration_minutes) : null,
      is_mandatory: v.is_mandatory,
      roles: v.roles as AppRole[],
      keywords: splitList(v.keywords),
    };
    if (v.id) {
      const { error } = await supabase.from("training_items").update(row).eq("id", v.id);
      if (error) return dbError(error);
      return { ok: true, data: { id: v.id }, message: "ההדרכה עודכנה" };
    }
    const { data, error } = await supabase
      .from("training_items")
      .insert({ ...row, created_by: userId, sort_order: await nextSortOrder(supabase, "training_items") })
      .select("id")
      .single();
    if (error) return dbError(error);
    return { ok: true, data: { id: data.id }, message: "ההדרכה נוספה" };
  });
}

// ---------------------------------------------------------------------
// חירום
// ---------------------------------------------------------------------
export async function saveEmergency(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = emergencySchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const v = parsed.data;

  return run<{ id: string }>(async ({ supabase }) => {
    const row = {
      slug: v.slug,
      title: v.title,
      icon: emptyToNull(v.icon),
      now_steps: splitLines(v.now_steps),
      dont_list: splitLines(v.dont_list),
      call_list: v.call_list.map((c) => ({ label: c.label, phone: c.phone })),
      report_text: emptyToNull(v.report_text),
      report_url: emptyToNull(v.report_url),
      procedure_id: emptyToNull(v.procedure_id),
    };
    if (v.id) {
      const { error } = await supabase.from("emergency_protocols").update(row).eq("id", v.id);
      if (error) return dbError(error);
      return { ok: true, data: { id: v.id }, message: "הכרטיס עודכן" };
    }
    const { data, error } = await supabase
      .from("emergency_protocols")
      .insert({ ...row, sort_order: await nextSortOrder(supabase, "emergency_protocols") })
      .select("id")
      .single();
    if (error) return dbError(error);
    return { ok: true, data: { id: data.id }, message: "הכרטיס נוסף" };
  });
}

// ---------------------------------------------------------------------
// מסלול קליטה
// ---------------------------------------------------------------------
export async function saveOnboardingItem(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const v = parsed.data;

  return run<{ id: string }>(async ({ supabase }) => {
    const row = {
      stage: v.stage,
      title: v.title,
      description: emptyToNull(v.description),
      url: emptyToNull(v.url),
      resource_id: emptyToNull(v.resource_id),
      training_id: emptyToNull(v.training_id),
    };
    if (v.id) {
      const { error } = await supabase.from("onboarding_items").update(row).eq("id", v.id);
      if (error) return dbError(error);
      return { ok: true, data: { id: v.id }, message: "הפריט עודכן" };
    }
    const { data, error } = await supabase
      .from("onboarding_items")
      .insert({ ...row, sort_order: await nextSortOrder(supabase, "onboarding_items") })
      .select("id")
      .single();
    if (error) return dbError(error);
    return { ok: true, data: { id: data.id }, message: "הפריט נוסף" };
  });
}

// ---------------------------------------------------------------------
// משתמשים והרשאות
// ---------------------------------------------------------------------
export async function updateProfile(input: unknown): Promise<ActionResult> {
  const parsed = profileUpdateSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const v = parsed.data;

  return run(async ({ supabase, userId }) => {
    if (v.id === userId && (v.role !== "admin" || !v.active)) {
      return { ok: false, error: "אי אפשר להסיר הרשאת אדמין או להשבית את המשתמש שלך" };
    }
    const { error } = await supabase
      .from("profiles")
      .update({ role: v.role as AppRole, active: v.active, full_name: emptyToNull(v.full_name) })
      .eq("id", v.id);
    if (error) return dbError(error);
    return { ok: true, message: "המשתמש עודכן" };
  });
}

export async function addAllowlistRule(input: unknown): Promise<ActionResult> {
  const parsed = allowlistSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const v = parsed.data;

  return run(async ({ supabase }) => {
    const { error } = await supabase.from("access_allowlist").insert({
      kind: v.kind,
      value: v.value,
      default_role: v.default_role as AppRole,
      note: emptyToNull(v.note),
    });
    if (error) return dbError(error);
    return {
      ok: true,
      message: v.kind === "domain" ? `כל מי שמתחבר עם @${v.value} יאושר אוטומטית` : `${v.value} אושר`,
    };
  });
}

// ---------------------------------------------------------------------
// תוכן ציבורי
// ---------------------------------------------------------------------
export async function savePublicContent(key: PublicContentKey, value: unknown): Promise<ActionResult> {
  if (!(key in publicContentSchemas)) return { ok: false, error: "אזור תוכן לא מוכר" };
  const schema = publicContentSchemas[key];
  const parsed = schema.safeParse(value);
  if (!parsed.success) return validationError(parsed.error);

  const result = await run(async ({ supabase, userId }) => {
    const { error } = await supabase
      .from("public_content")
      .upsert({ key, value: mergeContent(key, parsed.data), updated_by: userId }, { onConflict: "key" });
    if (error) return dbError(error);
    return { ok: true, message: "התוכן נשמר ויופיע באתר תוך רגע" };
  });
  if (result.ok) revalidatePath("/", "layout");
  return result;
}

export async function resetPublicContent(key: PublicContentKey): Promise<ActionResult> {
  if (!(key in publicContentSchemas)) return { ok: false, error: "אזור תוכן לא מוכר" };
  const result = await run(async ({ supabase }) => {
    const { error } = await supabase.from("public_content").delete().eq("key", key);
    if (error) return dbError(error);
    return { ok: true, message: "התוכן חזר לברירת המחדל" };
  });
  if (result.ok) revalidatePath("/", "layout");
  return result;
}

// ---------------------------------------------------------------------
// מחיקה וסידור
// ---------------------------------------------------------------------
export async function deleteItem(input: unknown): Promise<ActionResult> {
  const parsed = deleteSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const { table, id } = parsed.data;

  return run(async ({ supabase }) => {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return dbError(error);
    return { ok: true, message: "נמחק" };
  });
}

/** קבוצת הסידור: פריטים מוזזים רק בתוך הקבוצה שלהם */
const SCOPE_COLUMN: Partial<Record<ReorderableTable, "type" | "section" | "stage">> = {
  resources: "type",
  categories: "section",
  onboarding_items: "stage",
};

export async function moveItem(input: unknown): Promise<ActionResult> {
  const parsed = reorderSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const { table, id, direction } = parsed.data;

  return run(async ({ supabase }) => {
    const scopeColumn = SCOPE_COLUMN[table];
    const { data: rows, error } = await supabase.from(table).select("*").order("sort_order").order("id");
    if (error) return dbError(error);

    type Orderable = { id: string; sort_order: number } & Record<string, unknown>;
    const all = (rows ?? []) as unknown as Orderable[];
    const current = all.find((r) => r.id === id);
    if (!current) return { ok: false, error: "הפריט לא נמצא" };
    const list = scopeColumn ? all.filter((r) => r[scopeColumn] === current[scopeColumn]) : all;

    const index = list.findIndex((s) => s.id === id);
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || swapWith < 0 || swapWith >= list.length) return { ok: true };

    [list[index], list[swapWith]] = [list[swapWith], list[index]];
    const updates = list
      .map((item, i) => ({ id: item.id, sort_order: (i + 1) * 10, changed: item.sort_order !== (i + 1) * 10 }))
      .filter((u) => u.changed);

    for (const u of updates) {
      const { error: updateError } = await supabase.from(table).update({ sort_order: u.sort_order }).eq("id", u.id);
      if (updateError) return dbError(updateError);
    }
    return { ok: true };
  });
}
