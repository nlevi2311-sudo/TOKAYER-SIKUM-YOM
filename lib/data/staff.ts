import "server-only";
import { cache } from "react";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { demoData } from "@/lib/demo/data";
import { getDemoFavorites, getDemoRecent } from "@/lib/demo/store";
import { getSessionUser } from "@/lib/auth/session";
import { matchScore, telHref } from "@/lib/text";
import { RESOURCE_TYPE_LABELS } from "@/lib/labels";
import type {
  AnnouncementRow,
  AppRole,
  Category,
  CategoryRow,
  CategorySection,
  Contact,
  EmergencyProtocol,
  EmergencyProtocolRow,
  OnboardingItem,
  Resource,
  ResourceRow,
  ResourceType,
  SearchResult,
  TrainingItem,
  TrainingRow,
} from "@/types";

/**
 * שכבת הנתונים של אזור הצוות.
 * כל פונקציה עובדת מול Supabase עם הרשאות המשתמש (RLS), או מול נתוני ההדגמה.
 * שגיאות בסיס נתונים נזרקות הלאה ונתפסות ב-error.tsx של הנתיב.
 */

// ---------------------------------------------------------------------
// עזרים
// ---------------------------------------------------------------------
function canView(roles: AppRole[], role: AppRole, isAdmin: boolean): boolean {
  return isAdmin || roles.length === 0 || roles.includes(role);
}

function fail(context: string, error: { message: string } | null): never {
  throw new Error(`${context}: ${error?.message ?? "unknown error"}`);
}

const bySortOrder = <T extends { sort_order: number }>(a: T, b: T) => a.sort_order - b.sort_order;

// ---------------------------------------------------------------------
// קטגוריות
// ---------------------------------------------------------------------
export const getAllCategories = cache(async (): Promise<CategoryRow[]> => {
  if (isDemoMode()) return [...demoData.categories].sort(bySortOrder);
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) fail("categories", error);
  return data;
});

export async function getCategories(section?: CategorySection): Promise<Category[]> {
  const all = await getAllCategories();
  return section ? all.filter((c) => c.section === section) : all;
}

function attachCategory<T extends { category_id: string | null }>(
  rows: T[],
  categories: CategoryRow[],
): Array<T & { category: Resource["category"] }> {
  const map = new Map(categories.map((c) => [c.id, c]));
  return rows.map((row) => {
    const c = row.category_id ? map.get(row.category_id) : undefined;
    return {
      ...row,
      category: c ? { id: c.id, slug: c.slug, name: c.name, section: c.section } : null,
    };
  });
}

// ---------------------------------------------------------------------
// מועדפים (מזהים בלבד)
// ---------------------------------------------------------------------
type FavoriteIds = { resources: Set<string>; training: Set<string> };

export const getFavoriteIds = cache(async (): Promise<FavoriteIds> => {
  const ids: FavoriteIds = { resources: new Set(), training: new Set() };
  const user = await getSessionUser();
  if (!user) return ids;

  if (isDemoMode()) {
    for (const key of await getDemoFavorites()) {
      const [kind, id] = key.split(":");
      if (kind === "resource") ids.resources.add(id);
      if (kind === "training") ids.training.add(id);
    }
    return ids;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("favorites")
    .select("resource_id, training_id")
    .eq("user_id", user.id);
  if (error) fail("favorites", error);
  for (const f of data) {
    if (f.resource_id) ids.resources.add(f.resource_id);
    if (f.training_id) ids.training.add(f.training_id);
  }
  return ids;
});

// ---------------------------------------------------------------------
// משאבים
// ---------------------------------------------------------------------
const getVisibleResourceRows = cache(async (): Promise<ResourceRow[]> => {
  if (isDemoMode()) {
    const user = await getSessionUser();
    return demoData.resources
      .filter((r) => user && canView(r.roles, user.role, user.isAdmin))
      .sort(bySortOrder);
  }
  const supabase = await createClient();
  const { data, error } = await supabase.from("resources").select("*").order("sort_order").order("title");
  if (error) fail("resources", error);
  return data;
});

export type ResourceFilter = {
  types?: ResourceType[];
  quickAccess?: boolean;
  importantOnly?: boolean;
};

export async function getResources(filter: ResourceFilter = {}): Promise<Resource[]> {
  const [rows, categories, favorites] = await Promise.all([
    getVisibleResourceRows(),
    getAllCategories(),
    getFavoriteIds(),
  ]);

  const filtered = rows.filter(
    (r) =>
      (!filter.types || filter.types.includes(r.type)) &&
      (!filter.quickAccess || r.is_quick_access) &&
      (!filter.importantOnly || r.is_important),
  );

  return attachCategory(filtered, categories).map((r) => ({
    ...r,
    isFavorite: favorites.resources.has(r.id),
  }));
}

export async function getResourceById(id: string): Promise<Resource | null> {
  const all = await getResources();
  return all.find((r) => r.id === id) ?? null;
}

// ---------------------------------------------------------------------
// הדרכות
// ---------------------------------------------------------------------
const getVisibleTrainingRows = cache(async (): Promise<TrainingRow[]> => {
  if (isDemoMode()) {
    const user = await getSessionUser();
    return demoData.training
      .filter((t) => user && canView(t.roles, user.role, user.isAdmin))
      .sort(bySortOrder);
  }
  const supabase = await createClient();
  const { data, error } = await supabase.from("training_items").select("*").order("sort_order").order("title");
  if (error) fail("training", error);
  return data;
});

export async function getTrainingItems(): Promise<TrainingItem[]> {
  const [rows, categories, favorites] = await Promise.all([
    getVisibleTrainingRows(),
    getAllCategories(),
    getFavoriteIds(),
  ]);
  return attachCategory(rows, categories).map((t) => ({ ...t, isFavorite: favorites.training.has(t.id) }));
}

/** הדרכות שנוספו ב-45 הימים האחרונים */
export async function getNewTrainingItems(limit = 3): Promise<TrainingItem[]> {
  const items = await getTrainingItems();
  const since = Date.now() - 45 * 24 * 60 * 60 * 1000;
  return items
    .filter((t) => new Date(t.created_at).getTime() >= since)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit);
}

/** הכתובת הראשית של הדרכה: קישור, מצגת, סרטון או קובץ */
export function primaryTrainingUrl(t: Pick<TrainingRow, "link_url" | "slides_url" | "video_url" | "file_url">): string | null {
  return t.link_url ?? t.slides_url ?? t.video_url ?? t.file_url ?? null;
}

// ---------------------------------------------------------------------
// עדכונים
// ---------------------------------------------------------------------
export async function getAnnouncements(opts: { limit?: number; importantOnly?: boolean } = {}): Promise<AnnouncementRow[]> {
  const nowIso = new Date().toISOString();

  if (isDemoMode()) {
    return demoData.announcements
      .filter((a) => a.published_at <= nowIso && (!a.expires_at || a.expires_at > nowIso))
      .filter((a) => !opts.importantOnly || a.is_important)
      .sort((a, b) => b.published_at.localeCompare(a.published_at))
      .slice(0, opts.limit ?? 100);
  }

  const supabase = await createClient();
  let query = supabase
    .from("announcements")
    .select("*")
    .lte("published_at", nowIso)
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
    .order("is_important", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(opts.limit ?? 100);
  if (opts.importantOnly) query = query.eq("is_important", true);
  const { data, error } = await query;
  if (error) fail("announcements", error);
  return data;
}

// ---------------------------------------------------------------------
// אנשי קשר
// ---------------------------------------------------------------------
export async function getContacts(): Promise<Contact[]> {
  if (isDemoMode()) return [...demoData.contacts].sort(bySortOrder);
  const supabase = await createClient();
  const { data, error } = await supabase.from("contacts").select("*").order("sort_order").order("full_name");
  if (error) fail("contacts", error);
  return data;
}

// ---------------------------------------------------------------------
// חירום
// ---------------------------------------------------------------------
export async function getEmergencyProtocols(): Promise<EmergencyProtocol[]> {
  let rows: EmergencyProtocolRow[];
  if (isDemoMode()) {
    rows = [...demoData.emergency].sort(bySortOrder);
  } else {
    const supabase = await createClient();
    const { data, error } = await supabase.from("emergency_protocols").select("*").order("sort_order");
    if (error) fail("emergency", error);
    rows = data.map((row) => ({ ...row, call_list: Array.isArray(row.call_list) ? row.call_list : [] }));
  }
  const resources = await getVisibleResourceRows();
  const byId = new Map(resources.map((r) => [r.id, r]));
  return rows.map((row) => {
    const p = row.procedure_id ? byId.get(row.procedure_id) : undefined;
    return { ...row, procedure: p ? { id: p.id, title: p.title, url: p.url } : null };
  });
}

// ---------------------------------------------------------------------
// מסלול קליטה
// ---------------------------------------------------------------------
export type OnboardingEntry = OnboardingItem & {
  href: string | null;
  external: boolean;
  linkedTitle: string | null;
};

export async function getOnboardingItems(): Promise<OnboardingEntry[]> {
  let rows: OnboardingItem[];
  if (isDemoMode()) {
    rows = [...demoData.onboarding].sort(bySortOrder);
  } else {
    const supabase = await createClient();
    const { data, error } = await supabase.from("onboarding_items").select("*").order("sort_order");
    if (error) fail("onboarding", error);
    rows = data;
  }
  const [resources, training] = await Promise.all([getVisibleResourceRows(), getVisibleTrainingRows()]);
  const resMap = new Map(resources.map((r) => [r.id, r]));
  const trMap = new Map(training.map((t) => [t.id, t]));

  return rows.map((row) => {
    if (row.resource_id && resMap.has(row.resource_id)) {
      const r = resMap.get(row.resource_id)!;
      return { ...row, href: `/staff/open/resource/${r.id}`, external: true, linkedTitle: r.title };
    }
    if (row.training_id && trMap.has(row.training_id)) {
      const t = trMap.get(row.training_id)!;
      return { ...row, href: `/staff/training#${t.id}`, external: false, linkedTitle: t.title };
    }
    if (row.url) {
      return { ...row, href: row.url, external: /^https?:/i.test(row.url), linkedTitle: null };
    }
    return { ...row, href: null, external: false, linkedTitle: null };
  });
}

// ---------------------------------------------------------------------
// מועדפים ואחרונים
// ---------------------------------------------------------------------
export async function getFavorites(): Promise<{ resources: Resource[]; training: TrainingItem[] }> {
  const [resources, training] = await Promise.all([getResources(), getTrainingItems()]);
  return {
    resources: resources.filter((r) => r.isFavorite),
    training: training.filter((t) => t.isFavorite),
  };
}

export type RecentEntry = {
  kind: "resource" | "training";
  id: string;
  title: string;
  typeLabel: string;
  icon: string | null;
  href: string;
  openedAt: string;
};

export async function getRecentItems(limit = 5): Promise<RecentEntry[]> {
  const user = await getSessionUser();
  if (!user) return [];

  let refs: Array<{ resource_id: string | null; training_id: string | null; opened_at: string }>;
  if (isDemoMode()) {
    refs = (await getDemoRecent()).map((r) => {
      const [kind, id] = r.key.split(":");
      return {
        resource_id: kind === "resource" ? id : null,
        training_id: kind === "training" ? id : null,
        opened_at: r.at,
      };
    });
  } else {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("recent_items")
      .select("resource_id, training_id, opened_at")
      .eq("user_id", user.id)
      .order("opened_at", { ascending: false })
      .limit(limit * 2);
    if (error) fail("recent", error);
    refs = data;
  }

  const [resources, training] = await Promise.all([getVisibleResourceRows(), getVisibleTrainingRows()]);
  const resMap = new Map(resources.map((r) => [r.id, r]));
  const trMap = new Map(training.map((t) => [t.id, t]));

  const entries: RecentEntry[] = [];
  for (const ref of refs) {
    if (ref.resource_id && resMap.has(ref.resource_id)) {
      const r = resMap.get(ref.resource_id)!;
      entries.push({
        kind: "resource",
        id: r.id,
        title: r.title,
        typeLabel: RESOURCE_TYPE_LABELS[r.type],
        icon: r.icon,
        href: `/staff/open/resource/${r.id}`,
        openedAt: ref.opened_at,
      });
    } else if (ref.training_id && trMap.has(ref.training_id)) {
      const t = trMap.get(ref.training_id)!;
      entries.push({
        kind: "training",
        id: t.id,
        title: t.title,
        typeLabel: "הדרכה",
        icon: "graduation-cap",
        href: `/staff/open/training/${t.id}`,
        openedAt: ref.opened_at,
      });
    }
    if (entries.length >= limit) break;
  }
  return entries;
}

// ---------------------------------------------------------------------
// חיפוש
// ---------------------------------------------------------------------
const SEARCH_THRESHOLD = 0.45;

function categoryHref(section: CategorySection, slug: string): string {
  const base: Record<CategorySection, string> = {
    procedures: "/staff/procedures",
    forms: "/staff/forms",
    systems: "/staff/systems",
    training: "/staff/training",
    library: "/staff/library",
    links: "/staff/library",
  };
  return `${base[section]}?category=${encodeURIComponent(slug)}`;
}

/** כתובת פנימית לפתיחת תוצאת חיפוש. משאבים והדרכות עוברים דרך /staff/open כדי להירשם ב"אחרונים" */
export function searchResultHref(r: SearchResult): string {
  if (["system", "procedure", "form", "document", "link"].includes(r.kind)) return `/staff/open/resource/${r.id}`;
  if (r.kind === "training") return `/staff/open/training/${r.id}`;
  return r.url;
}

export async function searchAll(query: string, limit = 30): Promise<SearchResult[]> {
  const q = query.trim().slice(0, 100);
  if (!q) return [];

  if (!isDemoMode()) {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("search_all", { q, max_results: limit });
    if (error) fail("search", error);
    return (data ?? []).map((r) => ({ ...r, kind: r.kind as SearchResult["kind"] }));
  }

  // מצב הדגמה: אותו היגיון כמו search_all בבסיס הנתונים
  const [resources, training, contacts, categories, announcements] = await Promise.all([
    getResources(),
    getTrainingItems(),
    getContacts(),
    getAllCategories(),
    getAnnouncements(),
  ]);

  const results: SearchResult[] = [
    ...resources.map((r) => ({
      kind: r.type as SearchResult["kind"],
      id: r.id,
      title: r.title,
      subtitle: r.description,
      url: r.url,
      category: r.category?.name ?? null,
      score: matchScore(q, { title: r.title, keywords: r.keywords, description: r.description, extra: [r.category?.name] }),
    })),
    ...training.map((t) => ({
      kind: "training" as const,
      id: t.id,
      title: t.title,
      subtitle: t.summary,
      url: primaryTrainingUrl(t) ?? "/staff/training",
      category: t.category?.name ?? null,
      score: matchScore(q, { title: t.title, keywords: t.keywords, description: t.summary }),
    })),
    ...contacts.map((c) => ({
      kind: "contact" as const,
      id: c.id,
      title: c.full_name,
      subtitle: [c.role_title, c.responsibility].filter(Boolean).join(" · "),
      url: c.phone ? telHref(c.phone) : "/staff/contacts",
      category: c.department,
      score: Math.max(
        matchScore(q, { title: c.full_name }),
        matchScore(q, { title: c.role_title ?? "" }) * 0.85,
        matchScore(q, { title: "", description: c.responsibility }),
      ),
    })),
    ...categories.map((c) => ({
      kind: "category" as const,
      id: c.id,
      title: c.name,
      subtitle: c.description,
      url: categoryHref(c.section, c.slug),
      category: null,
      score: Math.min(matchScore(q, { title: c.name }), 0.8),
    })),
    ...announcements.map((a) => ({
      kind: "announcement" as const,
      id: a.id,
      title: a.title,
      subtitle: a.body.slice(0, 140),
      url: `/staff/updates#${a.id}`,
      category: null,
      score: Math.min(matchScore(q, { title: a.title }), 0.7),
    })),
  ];

  return results
    .filter((r) => r.score >= SEARCH_THRESHOLD)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "he"))
    .slice(0, limit);
}
