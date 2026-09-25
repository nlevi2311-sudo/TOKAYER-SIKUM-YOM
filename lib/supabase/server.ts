import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import type { Database } from "@/types/database";

/** לקוח Supabase בשם המשתמש המחובר. ה-RLS חל על כל שאילתה. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // נקרא מתוך Server Component. ה-proxy מרענן את הסשן, אז אפשר להתעלם.
        }
      },
    },
  });
}

/** לקוח אנונימי בלי cookies. לתוכן ציבורי בלבד, מאפשר cache של העמודים הציבוריים. */
export function createPublicClient() {
  return createSupabaseClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
