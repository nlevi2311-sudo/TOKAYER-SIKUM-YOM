/**
 * טיפוסי בסיס הנתונים, תואמים ל-supabase/migrations.
 * אפשר לייצר אותם מחדש אוטומטית עם:
 *   npx supabase gen types typescript --project-id <id> > types/database.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AppRole =
  | "admin"
  | "management"
  | "therapy"
  | "education"
  | "counselor"
  | "housemother"
  | "medical"
  | "office"
  | "staff";

export type ResourceType = "system" | "procedure" | "form" | "document" | "link";

export type CategorySection = "procedures" | "forms" | "systems" | "library" | "training" | "links";

export type AnnouncementKind =
  | "procedure"
  | "management"
  | "training"
  | "activity"
  | "system"
  | "operational";

export type OnboardingStage =
  | "day1"
  | "week1"
  | "month1"
  | "must_read"
  | "people"
  | "systems"
  | "procedures"
  | "trainings";

type Timestamps = { created_at: string; updated_at: string };

export type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: AppRole;
  active: boolean;
} & Timestamps;

export type AccessAllowlistRow = {
  id: string;
  kind: "domain" | "email";
  value: string;
  default_role: AppRole;
  note: string | null;
  created_at: string;
};

export type CategoryRow = {
  id: string;
  section: CategorySection;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
} & Timestamps;

export type ResourceRow = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  type: ResourceType;
  category_id: string | null;
  icon: string | null;
  roles: AppRole[];
  is_public: boolean;
  is_pinned: boolean;
  is_important: boolean;
  is_quick_access: boolean;
  owner: string | null;
  doc_type: string | null;
  keywords: string[];
  drive_file_id: string | null;
  content_updated_at: string | null;
  sort_order: number;
  created_by: string | null;
} & Timestamps;

export type TrainingRow = {
  id: string;
  title: string;
  summary: string | null;
  category_id: string | null;
  file_url: string | null;
  slides_url: string | null;
  video_url: string | null;
  link_url: string | null;
  duration_minutes: number | null;
  is_mandatory: boolean;
  roles: AppRole[];
  keywords: string[];
  sort_order: number;
  created_by: string | null;
} & Timestamps;

export type AnnouncementRow = {
  id: string;
  title: string;
  body: string;
  kind: AnnouncementKind;
  is_important: boolean;
  roles: AppRole[];
  link_url: string | null;
  published_at: string;
  expires_at: string | null;
  author_id: string | null;
  author_name: string | null;
} & Timestamps;

export type ContactRow = {
  id: string;
  full_name: string;
  role_title: string | null;
  responsibility: string | null;
  department: string | null;
  phone: string | null;
  email: string | null;
  is_emergency: boolean;
  sort_order: number;
} & Timestamps;

export type EmergencyCall = { label: string; phone: string };

export type EmergencyProtocolRow = {
  id: string;
  slug: string;
  title: string;
  icon: string | null;
  now_steps: string[];
  call_list: EmergencyCall[];
  dont_list: string[];
  report_text: string | null;
  report_url: string | null;
  procedure_id: string | null;
  sort_order: number;
} & Timestamps;

export type OnboardingItemRow = {
  id: string;
  stage: OnboardingStage;
  title: string;
  description: string | null;
  url: string | null;
  resource_id: string | null;
  training_id: string | null;
  sort_order: number;
} & Timestamps;

export type FavoriteRow = {
  id: string;
  user_id: string;
  resource_id: string | null;
  training_id: string | null;
  created_at: string;
};

export type RecentItemRow = {
  id: string;
  user_id: string;
  resource_id: string | null;
  training_id: string | null;
  opened_at: string;
};

export type PublicContentRow = {
  key: string;
  value: Json;
  updated_by: string | null;
} & Timestamps;

export type SearchResultRow = {
  kind: string;
  id: string;
  title: string;
  subtitle: string | null;
  url: string;
  category: string | null;
  score: number;
};

/** שדות אופציונליים בהכנסה: כל מה שיש לו default בבסיס הנתונים */
type InsertOf<Row, Required extends keyof Row> = Pick<Row, Required> & Partial<Omit<Row, Required>>;

type Table<Row, Required extends keyof Row> = {
  Row: Row;
  Insert: InsertOf<Row, Required>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<ProfileRow, "id" | "email">;
      access_allowlist: Table<AccessAllowlistRow, "kind" | "value">;
      categories: Table<CategoryRow, "section" | "slug" | "name">;
      resources: Table<ResourceRow, "title" | "url">;
      training_items: Table<TrainingRow, "title">;
      announcements: Table<AnnouncementRow, "title">;
      contacts: Table<ContactRow, "full_name">;
      emergency_protocols: Table<EmergencyProtocolRow, "slug" | "title">;
      onboarding_items: Table<OnboardingItemRow, "stage" | "title">;
      favorites: Table<FavoriteRow, "user_id">;
      recent_items: Table<RecentItemRow, "user_id">;
      public_content: Table<PublicContentRow, "key">;
    };
    Views: { [_ in never]: never };
    Functions: {
      search_all: {
        Args: { q: string; max_results?: number };
        Returns: SearchResultRow[];
      };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_active_staff: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      app_role: AppRole;
      resource_type: ResourceType;
      category_section: CategorySection;
      announcement_kind: AnnouncementKind;
      onboarding_stage: OnboardingStage;
    };
    CompositeTypes: { [_ in never]: never };
  };
};
