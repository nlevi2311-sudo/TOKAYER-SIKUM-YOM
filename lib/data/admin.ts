import "server-only";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { demoData } from "@/lib/demo/data";
import { DEMO_USER } from "@/lib/demo/user";
import type { AccessAllowlistRow, AnnouncementRow, ProfileRow } from "@/types";

/** קריאות שרק אדמין צריך. ה-RLS מחזיר תוצאות רק לאדמין בכל מקרה. */

export async function getProfiles(): Promise<ProfileRow[]> {
  if (isDemoMode()) {
    return [
      {
        id: DEMO_USER.id,
        email: DEMO_USER.email,
        full_name: DEMO_USER.fullName,
        avatar_url: null,
        role: "admin",
        active: true,
        created_at: "2026-09-01T08:00:00.000Z",
        updated_at: "2026-09-01T08:00:00.000Z",
      },
      {
        id: "00000000-0000-4000-8000-000000000de1",
        email: "new.staff@example.com",
        full_name: "עובד חדש לדוגמה",
        avatar_url: null,
        role: "staff",
        active: false,
        created_at: "2026-09-20T08:00:00.000Z",
        updated_at: "2026-09-20T08:00:00.000Z",
      },
    ];
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("active", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(`profiles: ${error.message}`);
  return data;
}

export async function getAllowlist(): Promise<AccessAllowlistRow[]> {
  if (isDemoMode()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("access_allowlist").select("*").order("kind").order("value");
  if (error) throw new Error(`allowlist: ${error.message}`);
  return data;
}

/** כל ההודעות, כולל מתוזמנות ושפג תוקפן */
export async function getAllAnnouncements(): Promise<AnnouncementRow[]> {
  if (isDemoMode()) return [...demoData.announcements].sort((a, b) => b.published_at.localeCompare(a.published_at));
  const supabase = await createClient();
  const { data, error } = await supabase.from("announcements").select("*").order("published_at", { ascending: false });
  if (error) throw new Error(`announcements: ${error.message}`);
  return data;
}

export async function getPublicContentRows(): Promise<Record<string, { value: unknown; updated_at: string }>> {
  if (isDemoMode()) return {};
  const supabase = await createClient();
  const { data, error } = await supabase.from("public_content").select("key, value, updated_at");
  if (error) throw new Error(`public_content: ${error.message}`);
  return Object.fromEntries(data.map((r) => [r.key, { value: r.value, updated_at: r.updated_at }]));
}
