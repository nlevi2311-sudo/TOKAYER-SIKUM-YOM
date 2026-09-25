/** משתני סביבה ציבוריים. ערכים סודיים (service role) לא נמצאים כאן ולא נחוצים לאפליקציה. */
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === "true",
};

export function isSupabaseConfigured(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

/**
 * מצב הדגמה: רק כשאין חיבור ל-Supabase וגם הופעל במפורש.
 * ברגע שמוגדר Supabase, מצב ההדגמה נכבה אוטומטית.
 */
export function isDemoMode(): boolean {
  return !isSupabaseConfigured() && env.demoMode;
}
