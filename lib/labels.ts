import type {
  AnnouncementKind,
  AppRole,
  CategorySection,
  OnboardingStage,
  ResourceType,
} from "@/types/database";

export const ROLES: AppRole[] = [
  "admin",
  "management",
  "therapy",
  "education",
  "counselor",
  "housemother",
  "medical",
  "office",
  "staff",
];

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "מנהל מערכת",
  management: "הנהלה",
  therapy: "צוות טיפולי",
  education: "צוות חינוכי",
  counselor: "הדרכה",
  housemother: "אמהות בית",
  medical: "צוות רפואי",
  office: "מנהלה ולוגיסטיקה",
  staff: "צוות",
};

export const RESOURCE_TYPES: ResourceType[] = ["system", "procedure", "form", "document", "link"];

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  system: "מערכת",
  procedure: "נוהל",
  form: "טופס",
  document: "מסמך",
  link: "קישור",
};

export const CATEGORY_SECTIONS: CategorySection[] = ["procedures", "forms", "systems", "library", "training", "links"];

export const CATEGORY_SECTION_LABELS: Record<CategorySection, string> = {
  procedures: "נהלים",
  forms: "טפסים",
  systems: "מערכות",
  library: "מרכז מסמכים",
  training: "הדרכות",
  links: "קישורים",
};

/** איזה סוג משאב שייך לאיזה אזור קטגוריות */
export const SECTION_FOR_TYPE: Record<ResourceType, CategorySection> = {
  procedure: "procedures",
  form: "forms",
  system: "systems",
  document: "library",
  link: "links",
};

export const ANNOUNCEMENT_KINDS: AnnouncementKind[] = [
  "management",
  "procedure",
  "training",
  "activity",
  "system",
  "operational",
];

export const ANNOUNCEMENT_KIND_LABELS: Record<AnnouncementKind, string> = {
  procedure: "נוהל חדש",
  management: "עדכון הנהלה",
  training: "הדרכה",
  activity: "פעילות",
  system: "שינוי במערכת",
  operational: "הודעה תפעולית",
};

export const ONBOARDING_STAGES: OnboardingStage[] = [
  "day1",
  "week1",
  "month1",
  "must_read",
  "people",
  "systems",
  "procedures",
  "trainings",
];

export const ONBOARDING_STAGE_LABELS: Record<OnboardingStage, string> = {
  day1: "יום ראשון",
  week1: "שבוע ראשון",
  month1: "חודש ראשון",
  must_read: "מה חייבים לקרוא",
  people: "אנשים שחשוב להכיר",
  systems: "מערכות שצריך להירשם אליהן",
  procedures: "נהלי חובה",
  trainings: "הכשרות חובה",
};

export const DOC_TYPES = [
  "google_doc",
  "google_sheet",
  "google_form",
  "google_slides",
  "google_folder",
  "pdf",
  "video",
  "web",
  "other",
] as const;

export type DocType = (typeof DOC_TYPES)[number];

export const DOC_TYPE_LABELS: Record<DocType, string> = {
  google_doc: "מסמך Google",
  google_sheet: "גיליון Google",
  google_form: "טופס Google",
  google_slides: "מצגת Google",
  google_folder: "תיקייה ב-Drive",
  pdf: "PDF",
  video: "סרטון",
  web: "אתר / מערכת",
  other: "אחר",
};

export function docTypeLabel(value: string | null | undefined): string {
  if (!value) return "";
  return (DOC_TYPE_LABELS as Record<string, string>)[value] ?? value;
}
