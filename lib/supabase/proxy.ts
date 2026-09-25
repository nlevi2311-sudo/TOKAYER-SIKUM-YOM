import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env, isSupabaseConfigured } from "@/lib/env";
import type { Database } from "@/types/database";

const PROTECTED_PREFIXES = ["/staff", "/admin"];

/**
 * מרענן את סשן Supabase בכל בקשה ומפנה משתמש לא מחובר לדף הכניסה.
 * זו בדיקה אופטימית בלבד. הבדיקה המחייבת (פרופיל פעיל, תפקיד) נעשית בשרת
 * בתוך ה-layouts וה-server actions, ובבסיס הנתונים דרך RLS.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured()) return response;

  const supabase = createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // חשוב: getUser מאמת את הטוקן מול Supabase ומרענן אותו במידת הצורך
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", path + request.nextUrl.search);
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }

  return response;
}
