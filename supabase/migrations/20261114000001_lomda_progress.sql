-- =====================================================================
-- לומדת קליטה: התקדמות של כל עובד
-- נשמר רק מה שהעובד עשה בלומדה (מסלול, ביתן, תשובות, צ'קליסט והצהרה).
-- אין כאן שום מידע על חניכים.
-- =====================================================================

create table public.lomda_progress (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  track text check (track in ('guide', 'sw', 'em', 'shs', 'rk', 'night')),
  bitan text,
  answers jsonb not null default '{"first": {}, "right": {}}'::jsonb,
  checks jsonb not null default '{}'::jsonb,
  declared boolean not null default false,
  units_done integer not null default 0,
  units_total integer not null default 0,
  first_correct integer not null default 0,
  questions_total integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger lomda_progress_updated_at
  before update on public.lomda_progress
  for each row execute function public.set_updated_at();

alter table public.lomda_progress enable row level security;

-- כל עובד רואה את ההתקדמות שלו. אדמין רואה את כולם.
create policy "lomda_select_own_or_admin" on public.lomda_progress
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- עובד פעיל כותב רק את השורה שלו
create policy "lomda_insert_own" on public.lomda_progress
  for insert to authenticated
  with check (user_id = auth.uid() and public.is_active_staff());

create policy "lomda_update_own" on public.lomda_progress
  for update to authenticated
  using (user_id = auth.uid() and public.is_active_staff())
  with check (user_id = auth.uid() and public.is_active_staff());

-- אדמין יכול לאפס התקדמות של עובד
create policy "lomda_admin_delete" on public.lomda_progress
  for delete to authenticated
  using (public.is_admin());
