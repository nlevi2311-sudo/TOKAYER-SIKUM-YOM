import { z } from "zod";
import { ANNOUNCEMENT_KINDS, CATEGORY_SECTIONS, ONBOARDING_STAGES, RESOURCE_TYPES, ROLES } from "@/lib/labels";

/**
 * סכמות אימות משותפות לטפסים בדפדפן (React Hook Form) ול-server actions.
 * השרת תמיד מאמת מחדש. אימות בדפדפן הוא רק לנוחות.
 */

const required = (label: string, max = 200) =>
  z.string().trim().min(1, `${label}: שדה חובה`).max(max, `${label}: עד ${max} תווים`);
const optional = (max = 500) => z.string().trim().max(max, `עד ${max} תווים`);

const URL_PATTERN = /^(https?:\/\/|mailto:|tel:|\/)/i;
const WEB_URL_PATTERN = /^(https?:\/\/|\/)/i;

export const linkUrl = z
  .string()
  .trim()
  .min(1, "כתובת: שדה חובה")
  .max(2000)
  .regex(URL_PATTERN, "הכתובת צריכה להתחיל ב https://, mailto:, tel: או / לעמוד פנימי");

export const optionalWebUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === "" || WEB_URL_PATTERN.test(v), "הכתובת צריכה להתחיל ב https:// או / לעמוד פנימי");

const optionalId = z.string().trim().refine((v) => v === "" || z.uuid().safeParse(v).success, "מזהה לא תקין");
const recordId = z.uuid().optional();
const roles = z.array(z.enum(ROLES as [string, ...string[]])).max(ROLES.length);
const dateString = z
  .string()
  .trim()
  .refine((v) => v === "" || !Number.isNaN(Date.parse(v)), "תאריך לא תקין");

export const resourceSchema = z.object({
  id: recordId,
  title: required("שם"),
  description: optional(1000),
  url: linkUrl,
  type: z.enum(RESOURCE_TYPES as ["system", "procedure", "form", "document", "link"]),
  category_id: optionalId,
  icon: optional(60),
  roles,
  is_public: z.boolean(),
  is_pinned: z.boolean(),
  is_important: z.boolean(),
  is_quick_access: z.boolean(),
  owner: optional(120),
  doc_type: optional(40),
  keywords: optional(500),
  content_updated_at: dateString,
  drive_file_id: optional(200),
});
export type ResourceInput = z.infer<typeof resourceSchema>;

export const categorySchema = z.object({
  id: recordId,
  section: z.enum(CATEGORY_SECTIONS as ["procedures", "forms", "systems", "library", "training", "links"]),
  slug: z
    .string()
    .trim()
    .min(1, "מזהה: שדה חובה")
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "מזהה באנגלית: אותיות קטנות, ספרות ומקף בלבד"),
  name: required("שם", 80),
  description: optional(300),
  icon: optional(60),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const announcementSchema = z.object({
  id: recordId,
  title: required("כותרת"),
  body: optional(5000),
  kind: z.enum(ANNOUNCEMENT_KINDS as ["procedure", "management", "training", "activity", "system", "operational"]),
  is_important: z.boolean(),
  roles,
  link_url: optionalWebUrl,
  published_at: dateString,
  expires_at: dateString,
});
export type AnnouncementInput = z.infer<typeof announcementSchema>;

export const contactSchema = z.object({
  id: recordId,
  full_name: required("שם", 120),
  role_title: optional(120),
  responsibility: optional(300),
  department: optional(80),
  phone: optional(40).refine((v) => v === "" || /^[0-9+*#()\s-]{2,}$/.test(v), "מספר טלפון לא תקין"),
  email: optional(200).refine((v) => v === "" || z.email().safeParse(v).success, "כתובת מייל לא תקינה"),
  is_emergency: z.boolean(),
});
export type ContactInput = z.infer<typeof contactSchema>;

export const trainingSchema = z.object({
  id: recordId,
  title: required("שם"),
  summary: optional(2000),
  category_id: optionalId,
  file_url: optionalWebUrl,
  slides_url: optionalWebUrl,
  video_url: optionalWebUrl,
  link_url: optionalWebUrl,
  duration_minutes: z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d+$/.test(v) && Number(v) > 0 && Number(v) < 1000), "מספר דקות לא תקין"),
  is_mandatory: z.boolean(),
  roles,
  keywords: optional(500),
});
export type TrainingInput = z.infer<typeof trainingSchema>;

export const emergencySchema = z.object({
  id: recordId,
  slug: z
    .string()
    .trim()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "מזהה באנגלית: אותיות קטנות, ספרות ומקף בלבד"),
  title: required("כותרת", 120),
  icon: optional(60),
  now_steps: optional(4000),
  dont_list: optional(4000),
  call_list: z
    .array(
      z.object({
        label: required("למי", 120),
        phone: optional(40),
      }),
    )
    .max(12),
  report_text: optional(1000),
  report_url: optionalWebUrl,
  procedure_id: optionalId,
});
export type EmergencyInput = z.infer<typeof emergencySchema>;

export const onboardingSchema = z.object({
  id: recordId,
  stage: z.enum(ONBOARDING_STAGES as ["day1", "week1", "month1", "must_read", "people", "systems", "procedures", "trainings"]),
  title: required("כותרת"),
  description: optional(1000),
  url: optionalWebUrl,
  resource_id: optionalId,
  training_id: optionalId,
});
export type OnboardingInput = z.infer<typeof onboardingSchema>;

export const profileUpdateSchema = z.object({
  id: z.uuid(),
  full_name: optional(120),
  role: z.enum(ROLES as [string, ...string[]]),
  active: z.boolean(),
});
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export const allowlistSchema = z
  .object({
    kind: z.enum(["domain", "email"]),
    value: z.string().trim().toLowerCase().min(3).max(200),
    default_role: z.enum(ROLES as [string, ...string[]]),
    note: optional(200),
  })
  .superRefine((v, ctx) => {
    if (v.kind === "email" && !z.email().safeParse(v.value).success) {
      ctx.addIssue({ code: "custom", path: ["value"], message: "כתובת מייל לא תקינה" });
    }
    if (v.kind === "domain" && !/^[a-z0-9]+([.-][a-z0-9]+)*\.[a-z]{2,}$/.test(v.value)) {
      ctx.addIssue({ code: "custom", path: ["value"], message: "דומיין לא תקין. למשל tokayer.org.il" });
    }
  });
export type AllowlistInput = z.infer<typeof allowlistSchema>;

export const REORDERABLE_TABLES = [
  "resources",
  "categories",
  "training_items",
  "contacts",
  "emergency_protocols",
  "onboarding_items",
] as const;
export type ReorderableTable = (typeof REORDERABLE_TABLES)[number];

export const reorderSchema = z.object({
  table: z.enum(REORDERABLE_TABLES),
  id: z.uuid(),
  direction: z.enum(["up", "down"]),
});

export const deleteSchema = z.object({
  table: z.enum([...REORDERABLE_TABLES, "announcements", "access_allowlist"] as const),
  id: z.uuid(),
});

/** "מילה, מילה" -> ["מילה", "מילה"] */
export function splitList(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 40);
}

/** שורות טקסט -> מערך */
export function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 40);
}

export const emptyToNull = (v: string | undefined | null): string | null => {
  const t = (v ?? "").trim();
  return t === "" ? null : t;
};
