-- =====================================================================
-- מאגר הידע של העוזר: מסמכים שההנהלה מעלה, והעוזר עונה רק לפיהם
-- אסור להעלות כאן מידע מזהה על חניכים. נבדק גם בממשק.
-- =====================================================================

create table public.ai_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  content text not null check (char_length(content) between 1 and 300000),
  source_name text,
  active boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index ai_documents_active_idx on public.ai_documents (created_at) where active;

create trigger ai_documents_updated_at
  before update on public.ai_documents
  for each row execute function public.set_updated_at();

alter table public.ai_documents enable row level security;

-- העוזר רץ בשם העובד המחובר, ולכן עובד פעיל קורא את המסמכים הפעילים
create policy "ai_documents_staff_select" on public.ai_documents
  for select to authenticated
  using (public.is_admin() or (active and public.is_active_staff()));

create policy "ai_documents_admin_write" on public.ai_documents
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
