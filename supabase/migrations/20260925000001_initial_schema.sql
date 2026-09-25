-- =====================================================================
-- Tokayer Hub: סכמת בסיס הנתונים
-- הערה חשובה: האפליקציה לא שומרת שום מידע אישי, רפואי או טיפולי על חניכים.
-- הטבלאות כאן מכילות רק קישורים, נהלים, הודעות ופרטי קשר של אנשי צוות.
-- =====================================================================

create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------
-- טיפוסים
-- ---------------------------------------------------------------------
create type public.app_role as enum (
  'admin',
  'management',
  'therapy',
  'education',
  'counselor',
  'housemother',
  'medical',
  'office',
  'staff'
);

create type public.resource_type as enum (
  'system',     -- מערכת (תלם, EasyShift...)
  'procedure',  -- נוהל
  'form',       -- טופס
  'document',   -- מסמך כללי במרכז המסמכים
  'link'        -- קישור כללי
);

create type public.category_section as enum (
  'procedures',
  'forms',
  'systems',
  'library',
  'training',
  'links'
);

create type public.announcement_kind as enum (
  'procedure',    -- נוהל חדש
  'management',   -- עדכון הנהלה
  'training',     -- הדרכה
  'activity',     -- פעילות
  'system',       -- שינוי במערכת
  'operational'   -- הודעה תפעולית
);

create type public.onboarding_stage as enum (
  'day1',
  'week1',
  'month1',
  'must_read',
  'people',
  'systems',
  'procedures',
  'trainings'
);

-- ---------------------------------------------------------------------
-- פונקציית עזר לעדכון updated_at
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- profiles: משתמשי אזור הצוות
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  role public.app_role not null default 'staff',
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_email_idx on public.profiles (lower(email));
create index profiles_role_idx on public.profiles (role) where active;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- access_allowlist: דומיינים ומיילים שמאושרים אוטומטית בכניסה ראשונה
-- ---------------------------------------------------------------------
create table public.access_allowlist (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('domain', 'email')),
  value text not null,
  default_role public.app_role not null default 'staff',
  note text,
  created_at timestamptz not null default now(),
  constraint access_allowlist_value_lower check (value = lower(value)),
  constraint access_allowlist_unique unique (kind, value)
);

-- ---------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  section public.category_section not null,
  slug text not null,
  name text not null,
  description text,
  icon text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_section_slug_unique unique (section, slug)
);

create index categories_section_idx on public.categories (section, sort_order);
create index categories_name_trgm_idx on public.categories using gin (name gin_trgm_ops);

create trigger categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- resources: קישורים, מערכות, נהלים, טפסים ומסמכים
-- המסמך עצמו נשאר במקור (בדרך כלל Google Drive). כאן נשמר רק הקישור.
-- ---------------------------------------------------------------------
create table public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  url text not null,
  type public.resource_type not null default 'link',
  category_id uuid references public.categories (id) on delete set null,
  icon text,
  -- תפקידים שמורשים לראות. מערך ריק = כל אנשי הצוות הפעילים
  roles public.app_role[] not null default '{}',
  is_public boolean not null default false,
  is_pinned boolean not null default false,
  is_important boolean not null default false,
  -- מופיע ב"גישה מהירה" בדף הבית של הצוות
  is_quick_access boolean not null default false,
  -- אחראי על הנוהל / המסמך
  owner text,
  -- סוג קובץ: google_doc, google_sheet, google_form, google_slides, pdf, video, web, other
  doc_type text,
  keywords text[] not null default '{}',
  -- מזהה קובץ ב-Google Drive, לחיבור עתידי ל-Drive API
  drive_file_id text,
  -- תאריך העדכון האחרון של התוכן עצמו (לא של הרשומה)
  content_updated_at date,
  sort_order integer not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint resources_url_scheme check (url ~* '^(https?://|mailto:|tel:|/)')
);

create index resources_type_idx on public.resources (type, sort_order);
create index resources_category_idx on public.resources (category_id);
create index resources_quick_idx on public.resources (sort_order) where is_quick_access;
create index resources_roles_idx on public.resources using gin (roles);
create index resources_keywords_idx on public.resources using gin (keywords);
create index resources_title_trgm_idx on public.resources using gin (title gin_trgm_ops);
create index resources_description_trgm_idx on public.resources using gin (description gin_trgm_ops);

create trigger resources_updated_at
  before update on public.resources
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- training_items: הדרכות
-- ---------------------------------------------------------------------
create table public.training_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  category_id uuid references public.categories (id) on delete set null,
  file_url text,
  slides_url text,
  video_url text,
  link_url text,
  duration_minutes integer check (duration_minutes is null or duration_minutes > 0),
  is_mandatory boolean not null default false,
  roles public.app_role[] not null default '{}',
  keywords text[] not null default '{}',
  sort_order integer not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint training_urls_scheme check (
    (file_url is null or file_url ~* '^(https?://|/)')
    and (slides_url is null or slides_url ~* '^(https?://|/)')
    and (video_url is null or video_url ~* '^(https?://|/)')
    and (link_url is null or link_url ~* '^(https?://|/)')
  )
);

create index training_category_idx on public.training_items (category_id, sort_order);
create index training_created_idx on public.training_items (created_at desc);
create index training_title_trgm_idx on public.training_items using gin (title gin_trgm_ops);
create index training_keywords_idx on public.training_items using gin (keywords);

create trigger training_items_updated_at
  before update on public.training_items
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- announcements: עדכונים פנימיים
-- ---------------------------------------------------------------------
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  kind public.announcement_kind not null default 'operational',
  is_important boolean not null default false,
  roles public.app_role[] not null default '{}',
  link_url text check (link_url is null or link_url ~* '^(https?://|/)'),
  published_at timestamptz not null default now(),
  expires_at timestamptz,
  author_id uuid references public.profiles (id) on delete set null,
  author_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index announcements_published_idx on public.announcements (published_at desc);
create index announcements_important_idx on public.announcements (published_at desc) where is_important;
create index announcements_title_trgm_idx on public.announcements using gin (title gin_trgm_ops);

create trigger announcements_updated_at
  before update on public.announcements
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- contacts: אנשי קשר של הצוות (לא של חניכים)
-- ---------------------------------------------------------------------
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  role_title text,
  responsibility text,
  department text,
  phone text,
  email text,
  -- מופיע במוקד ובמסך החירום
  is_emergency boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contacts_name_trgm_idx on public.contacts using gin (full_name gin_trgm_ops);
create index contacts_role_trgm_idx on public.contacts using gin (role_title gin_trgm_ops);
create index contacts_order_idx on public.contacts (sort_order, full_name);

create trigger contacts_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- emergency_protocols: כרטיסי "חירום ונהלים מיידיים"
-- התוכן המקצועי מוזן על ידי ההנהלה בלבד. אין להמציא הנחיות.
-- ---------------------------------------------------------------------
create table public.emergency_protocols (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  icon text,
  now_steps text[] not null default '{}',
  call_list jsonb not null default '[]'::jsonb,
  dont_list text[] not null default '{}',
  report_text text,
  report_url text check (report_url is null or report_url ~* '^(https?://|/)'),
  procedure_id uuid references public.resources (id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint emergency_call_list_array check (jsonb_typeof(call_list) = 'array')
);

create trigger emergency_protocols_updated_at
  before update on public.emergency_protocols
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- onboarding_items: מסלול קליטה לעובד חדש
-- ---------------------------------------------------------------------
create table public.onboarding_items (
  id uuid primary key default gen_random_uuid(),
  stage public.onboarding_stage not null,
  title text not null,
  description text,
  url text check (url is null or url ~* '^(https?://|mailto:|tel:|/)'),
  resource_id uuid references public.resources (id) on delete set null,
  training_id uuid references public.training_items (id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index onboarding_stage_idx on public.onboarding_items (stage, sort_order);

create trigger onboarding_items_updated_at
  before update on public.onboarding_items
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- favorites + recent_items: לכל עובד
-- פריט הוא משאב (resource) או הדרכה (training). בדיוק אחד מהשניים.
-- ---------------------------------------------------------------------
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  resource_id uuid references public.resources (id) on delete cascade,
  training_id uuid references public.training_items (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint favorites_one_target check (num_nonnulls(resource_id, training_id) = 1)
);

create unique index favorites_user_resource_uidx on public.favorites (user_id, resource_id) where resource_id is not null;
create unique index favorites_user_training_uidx on public.favorites (user_id, training_id) where training_id is not null;
create index favorites_user_idx on public.favorites (user_id, created_at desc);

create table public.recent_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  resource_id uuid references public.resources (id) on delete cascade,
  training_id uuid references public.training_items (id) on delete cascade,
  opened_at timestamptz not null default now(),
  constraint recent_one_target check (num_nonnulls(resource_id, training_id) = 1)
);

create unique index recent_user_resource_uidx on public.recent_items (user_id, resource_id) where resource_id is not null;
create unique index recent_user_training_uidx on public.recent_items (user_id, training_id) where training_id is not null;
create index recent_user_opened_idx on public.recent_items (user_id, opened_at desc);

-- ---------------------------------------------------------------------
-- public_content: תוכן האתר הציבורי שניתן לעריכה מממשק הניהול
-- ---------------------------------------------------------------------
create table public.public_content (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint public_content_object check (jsonb_typeof(value) = 'object')
);

create trigger public_content_updated_at
  before update on public.public_content
  for each row execute function public.set_updated_at();

-- =====================================================================
-- פונקציות הרשאה. security definer כדי שיוכלו לקרוא את profiles בלי לולאת RLS
-- =====================================================================
create or replace function public.auth_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and active;
$$;

create or replace function public.is_active_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and active);
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and active and role = 'admin'
  );
$$;

create or replace function public.can_view(allowed public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when public.is_admin() then true
    when not public.is_active_staff() then false
    when coalesce(cardinality(allowed), 0) = 0 then true
    else public.auth_role() = any (allowed)
  end;
$$;

-- =====================================================================
-- יצירת פרופיל אוטומטית בכניסה ראשונה
-- משתמש מאושר רק אם המייל או הדומיין שלו מופיעים ב-access_allowlist
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(new.email);
  v_domain text := split_part(lower(new.email), '@', 2);
  v_rule public.access_allowlist;
begin
  select * into v_rule
  from public.access_allowlist
  where (kind = 'email' and value = v_email)
     or (kind = 'domain' and value = v_domain)
  order by case kind when 'email' then 0 else 1 end
  limit 1;

  insert into public.profiles (id, email, full_name, avatar_url, role, active)
  values (
    new.id,
    v_email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    coalesce(v_rule.default_role, 'staff'),
    v_rule.id is not null
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- כשמוסיפים כלל גישה, משתמשים קיימים שתואמים לו מופעלים
create or replace function public.apply_allowlist_rule()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.kind = 'email' then
    update public.profiles
      set active = true, role = case when role = 'staff' then new.default_role else role end
      where lower(email) = new.value and not active;
  else
    update public.profiles
      set active = true, role = case when role = 'staff' then new.default_role else role end
      where split_part(lower(email), '@', 2) = new.value and not active;
  end if;
  return new;
end;
$$;

create trigger access_allowlist_apply
  after insert on public.access_allowlist
  for each row execute function public.apply_allowlist_rule();

-- הגבלה על שמירת פריטים אחרונים: 30 לכל עובד
create or replace function public.trim_recent_items()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.recent_items
  where user_id = new.user_id
    and id in (
      select id from public.recent_items
      where user_id = new.user_id
      order by opened_at desc
      offset 30
    );
  return new;
end;
$$;

create trigger recent_items_trim
  after insert on public.recent_items
  for each row execute function public.trim_recent_items();

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.access_allowlist enable row level security;
alter table public.categories enable row level security;
alter table public.resources enable row level security;
alter table public.training_items enable row level security;
alter table public.announcements enable row level security;
alter table public.contacts enable row level security;
alter table public.emergency_protocols enable row level security;
alter table public.onboarding_items enable row level security;
alter table public.favorites enable row level security;
alter table public.recent_items enable row level security;
alter table public.public_content enable row level security;

-- profiles: כל אחד רואה את עצמו, אדמין רואה ומעדכן את כולם.
-- משתמש רגיל לא יכול לשנות לעצמו תפקיד או סטטוס.
create policy "profiles_select_own_or_admin" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "profiles_admin_update" on public.profiles
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "profiles_admin_delete" on public.profiles
  for delete to authenticated
  using (public.is_admin() and id <> auth.uid());

-- access_allowlist: אדמין בלבד
create policy "allowlist_admin_all" on public.access_allowlist
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- categories: כל עובד פעיל קורא, אדמין כותב
create policy "categories_staff_select" on public.categories
  for select to authenticated
  using (public.is_active_staff());

create policy "categories_admin_write" on public.categories
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- resources: ציבורי לכולם, אחרת לפי תפקיד
create policy "resources_public_select" on public.resources
  for select to anon, authenticated
  using (is_public);

create policy "resources_staff_select" on public.resources
  for select to authenticated
  using (public.can_view(roles));

create policy "resources_admin_write" on public.resources
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- training_items
create policy "training_staff_select" on public.training_items
  for select to authenticated
  using (public.can_view(roles));

create policy "training_admin_write" on public.training_items
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- announcements
create policy "announcements_staff_select" on public.announcements
  for select to authenticated
  using (
    public.is_admin()
    or (
      public.can_view(roles)
      and published_at <= now()
      and (expires_at is null or expires_at > now())
    )
  );

create policy "announcements_admin_write" on public.announcements
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- contacts: צוות בלבד. לא חשוף לציבור.
create policy "contacts_staff_select" on public.contacts
  for select to authenticated
  using (public.is_active_staff());

create policy "contacts_admin_write" on public.contacts
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- emergency_protocols
create policy "emergency_staff_select" on public.emergency_protocols
  for select to authenticated
  using (public.is_active_staff());

create policy "emergency_admin_write" on public.emergency_protocols
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- onboarding_items
create policy "onboarding_staff_select" on public.onboarding_items
  for select to authenticated
  using (public.is_active_staff());

create policy "onboarding_admin_write" on public.onboarding_items
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- favorites + recent_items: כל עובד רק את שלו
create policy "favorites_own" on public.favorites
  for all to authenticated
  using (user_id = auth.uid() and public.is_active_staff())
  with check (user_id = auth.uid() and public.is_active_staff());

create policy "recent_own" on public.recent_items
  for all to authenticated
  using (user_id = auth.uid() and public.is_active_staff())
  with check (user_id = auth.uid() and public.is_active_staff());

-- public_content: קריאה לכולם, כתיבה לאדמין
create policy "public_content_select" on public.public_content
  for select to anon, authenticated
  using (true);

create policy "public_content_admin_write" on public.public_content
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =====================================================================
-- חיפוש מאוחד. security invoker: ה-RLS של המשתמש חל על התוצאות
-- =====================================================================
create or replace function public.search_all(q text, max_results integer default 30)
returns table (
  kind text,
  id uuid,
  title text,
  subtitle text,
  url text,
  category text,
  score real
)
language sql
stable
security invoker
set search_path = public
as $$
  with term as (
    select
      trim(q) as t,
      -- גזע פשוט: בלי האות האחרונה, כדי ש"בריחה" ימצא את "בריחת"
      case when char_length(trim(q)) >= 4 then left(trim(q), char_length(trim(q)) - 1) else trim(q) end as stem
  ),
  hits as (
    select
      case r.type
        when 'system' then 'system'
        when 'procedure' then 'procedure'
        when 'form' then 'form'
        when 'document' then 'document'
        else 'link'
      end as kind,
      r.id,
      r.title,
      r.description as subtitle,
      r.url,
      c.name as category,
      greatest(
        case when lower(r.title) = lower(term.t) then 1 else 0 end,
        least(word_similarity(term.t, r.title), 0.95),
        case when r.title ilike '%' || term.stem || '%' then 0.9 else 0 end,
        case when exists (select 1 from unnest(r.keywords) k where k ilike term.stem || '%') then 0.85 else 0 end,
        case when coalesce(r.description, '') ilike '%' || term.stem || '%' then 0.5 else 0 end,
        case when coalesce(c.name, '') ilike '%' || term.stem || '%' then 0.45 else 0 end
      )::real as score
    from public.resources r
    left join public.categories c on c.id = r.category_id
    cross join term

    union all

    select
      'training', t.id, t.title, t.summary,
      coalesce(t.link_url, t.file_url, t.slides_url, t.video_url, '/staff/training'),
      c.name,
      greatest(
        case when lower(t.title) = lower(term.t) then 1 else 0 end,
        least(word_similarity(term.t, t.title), 0.95),
        case when t.title ilike '%' || term.stem || '%' then 0.9 else 0 end,
        case when exists (select 1 from unnest(t.keywords) k where k ilike term.stem || '%') then 0.85 else 0 end,
        case when coalesce(t.summary, '') ilike '%' || term.stem || '%' then 0.5 else 0 end
      )::real
    from public.training_items t
    left join public.categories c on c.id = t.category_id
    cross join term

    union all

    select
      'contact', ct.id, ct.full_name,
      concat_ws(' · ', ct.role_title, ct.responsibility),
      case when ct.phone is not null then 'tel:' || regexp_replace(ct.phone, '[^0-9+]', '', 'g') else '/staff/contacts' end,
      ct.department,
      greatest(
        least(word_similarity(term.t, ct.full_name), 0.95),
        case when ct.full_name ilike '%' || term.stem || '%' then 0.9 else 0 end,
        case when coalesce(ct.role_title, '') ilike '%' || term.stem || '%' then 0.8 else 0 end,
        case when coalesce(ct.responsibility, '') ilike '%' || term.stem || '%' then 0.6 else 0 end
      )::real
    from public.contacts ct
    cross join term

    union all

    select
      'category', c.id, c.name, c.description,
      case c.section
        when 'procedures' then '/staff/procedures?category=' || c.slug
        when 'forms' then '/staff/forms?category=' || c.slug
        when 'systems' then '/staff/systems?category=' || c.slug
        when 'training' then '/staff/training?category=' || c.slug
        else '/staff/library?category=' || c.slug
      end,
      null,
      least(greatest(
        word_similarity(term.t, c.name),
        case when c.name ilike '%' || term.stem || '%' then 0.8 else 0 end
      ), 0.8)::real
    from public.categories c
    cross join term

    union all

    select
      'announcement', a.id, a.title, left(a.body, 140), '/staff/updates#' || a.id::text, null,
      least(greatest(
        word_similarity(term.t, a.title),
        case when a.title ilike '%' || term.stem || '%' then 0.7 else 0 end
      ), 0.7)::real
    from public.announcements a
    cross join term
  )
  select kind, id, title, subtitle, url, category, score
  from hits
  where score >= 0.45 and char_length((select t from term)) > 0
  order by score desc, title
  limit greatest(1, least(max_results, 100));
$$;

grant execute on function public.search_all(text, integer) to authenticated;
revoke execute on function public.search_all(text, integer) from anon;
