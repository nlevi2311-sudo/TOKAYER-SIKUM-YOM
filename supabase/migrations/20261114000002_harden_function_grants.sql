-- =====================================================================
-- הקשחת הרשאות לפונקציות (לפי ה Security Advisor של Supabase)
-- פונקציות טריגר לא נקראות ישירות מה API. פונקציות ההרשאה נחוצות רק למשתמש מחובר.
-- =====================================================================

alter function public.set_updated_at() set search_path = public;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.apply_allowlist_rule() from public, anon, authenticated;
revoke execute on function public.trim_recent_items() from public, anon, authenticated;

revoke execute on function public.auth_role() from public, anon;
revoke execute on function public.is_active_staff() from public, anon;
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.can_view(public.app_role[]) from public, anon;
grant execute on function public.auth_role() to authenticated;
grant execute on function public.is_active_staff() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.can_view(public.app_role[]) to authenticated;
