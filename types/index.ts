import type {
  AnnouncementRow,
  AppRole,
  CategoryRow,
  ContactRow,
  EmergencyProtocolRow,
  OnboardingItemRow,
  ResourceRow,
  TrainingRow,
} from "./database";

export type * from "./database";

/** המשתמש המחובר, כפי שהאפליקציה רואה אותו אחרי בדיקת הרשאות בצד השרת */
export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  firstName: string;
  avatarUrl: string | null;
  role: AppRole;
  active: boolean;
  isAdmin: boolean;
  isDemo: boolean;
};

export type Category = Pick<CategoryRow, "id" | "section" | "slug" | "name" | "description" | "icon" | "sort_order">;

export type Resource = ResourceRow & {
  category: Pick<CategoryRow, "id" | "slug" | "name" | "section"> | null;
  isFavorite?: boolean;
};

export type TrainingItem = TrainingRow & {
  category: Pick<CategoryRow, "id" | "slug" | "name" | "section"> | null;
  isFavorite?: boolean;
};

export type Announcement = AnnouncementRow;
export type Contact = ContactRow;
export type EmergencyProtocol = EmergencyProtocolRow & {
  procedure: Pick<ResourceRow, "id" | "title" | "url"> | null;
};
export type OnboardingItem = OnboardingItemRow;

/** פריט שיכול להיות מועדף או "אחרון": משאב או הדרכה */
export type ItemRef = { kind: "resource"; id: string } | { kind: "training"; id: string };

export type LibraryItem =
  | ({ itemKind: "resource" } & Resource)
  | ({ itemKind: "training" } & TrainingItem);

export type SearchResult = {
  kind: "system" | "procedure" | "form" | "document" | "link" | "training" | "contact" | "category" | "announcement";
  id: string;
  title: string;
  subtitle: string | null;
  url: string;
  category: string | null;
  score: number;
};

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };
