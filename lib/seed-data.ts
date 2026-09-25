/**
 * נתוני דוגמה בעברית.
 * משמשים לשני דברים:
 *   1. יצירת supabase/seed.sql (npm run seed:generate)
 *   2. מצב הדגמה (NEXT_PUBLIC_DEMO_MODE=true) כשאין עדיין חיבור ל-Supabase
 *
 * כתובות שלא ידועות לנו מסומנות בכתובת זמנית PLACEHOLDER_URL.
 * האפליקציה מציגה תגית "קישור זמני" לכל פריט כזה, כדי שיהיה קל לזהות מה צריך לעדכן.
 *
 * הקובץ נטען גם ישירות ב-Node, לכן: רק import type, בלי aliases.
 */
import type {
  AnnouncementRow,
  AppRole,
  CategoryRow,
  CategorySection,
  ContactRow,
  EmergencyProtocolRow,
  OnboardingItemRow,
  ResourceRow,
  ResourceType,
  TrainingRow,
} from "../types/database";

export const PLACEHOLDER_URL = "https://example.com/replace-me";

const SEED_TIME = "2026-09-01T08:00:00.000Z";

function uuid(prefix: string, n: number): string {
  return `${prefix}0000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
}

// ---------------------------------------------------------------------
// קטגוריות
// ---------------------------------------------------------------------
type CatSeed = [slug: string, name: string, icon: string];

const categorySeeds: Record<CategorySection, CatSeed[]> = {
  procedures: [
    ["protection", "מוגנות", "shield-check"],
    ["incidents", "אירועים חריגים", "triangle-alert"],
    ["runaway", "בריחה", "footprints"],
    ["violence", "אלימות", "hand"],
    ["suicide", "אובדנות", "heart-pulse"],
    ["medication", "תרופות", "pill"],
    ["sos", "SOS", "siren"],
    ["home-leave", "יציאה וחזרה מחופשה", "house"],
    ["night", "עבודה בלילה", "moon"],
    ["phones", "טלפונים", "smartphone"],
    ["social-media", "רשתות חברתיות", "message-circle"],
    ["parents", "עבודה מול הורים", "users"],
    ["reporting", "דיווח ופיקוח", "clipboard-check"],
    ["houses", "ביתנים", "house-plus"],
    ["routines", "שגרות עבודה", "calendar-check"],
  ],
  forms: [
    ["incident", "אירוע חריג", "triangle-alert"],
    ["intake", "קליטת ילד", "user-plus"],
    ["leave-out", "יציאה לחופשה", "log-out"],
    ["leave-return", "חזרה מחופשה", "log-in"],
    ["medical", "דיווח רפואי", "stethoscope"],
    ["committees", "ועדות", "gavel"],
    ["school", "בית ספר", "school"],
    ["attendance", "נוכחות", "clock"],
    ["maintenance", "תחזוקה", "wrench"],
    ["hr", "משאבי אנוש", "id-card"],
    ["recruitment", "גיוס", "briefcase"],
    ["purchasing", "רכש", "shopping-cart"],
    ["expenses", "החזר הוצאות", "receipt"],
  ],
  systems: [
    ["core", "מערכות ליבה", "layout-grid"],
    ["google", "Google Workspace", "cloud"],
    ["shifts", "משמרות ונוכחות", "calendar-clock"],
  ],
  library: [
    ["policy", "מדיניות וקווים מנחים", "book-open"],
    ["templates", "תבניות", "file-text"],
    ["general", "כללי", "folder"],
  ],
  training: [
    ["new-employee", "קליטת עובד חדש", "sparkles"],
    ["protection", "מוגנות", "shield-check"],
    ["de-escalation", "מניעת הסלמה", "wind"],
    ["nvc", "תקשורת לא אלימה", "message-square-heart"],
    ["boundaries", "גבולות", "fence"],
    ["extreme-events", "אירועי קיצון", "zap"],
    ["daily-therapeutic", "עבודה טיפולית בחיי היומיום", "sun"],
    ["parents", "עבודה עם הורים", "users"],
    ["incident-writing", "כתיבת אירועים", "pen-line"],
    ["talam", "עבודה במערכת תלם", "monitor"],
    ["medication", "נהלי תרופות", "pill"],
  ],
  links: [["general", "קישורים כלליים", "link"]],
};

const sectionPrefix: Record<CategorySection, number> = {
  procedures: 100,
  forms: 200,
  systems: 300,
  library: 400,
  training: 500,
  links: 600,
};

export const seedCategories: CategoryRow[] = (Object.keys(categorySeeds) as CategorySection[]).flatMap(
  (section) =>
    categorySeeds[section].map(([slug, name, icon], i) => ({
      id: uuid("1", sectionPrefix[section] + i + 1),
      section,
      slug,
      name,
      description: null,
      icon,
      sort_order: (i + 1) * 10,
      created_at: SEED_TIME,
      updated_at: SEED_TIME,
    })),
);

function cat(section: CategorySection, slug: string): string {
  const found = seedCategories.find((c) => c.section === section && c.slug === slug);
  if (!found) throw new Error(`Unknown seed category ${section}/${slug}`);
  return found.id;
}

// ---------------------------------------------------------------------
// משאבים: מערכות, קישורים, נהלים, טפסים, מסמכים
// ---------------------------------------------------------------------
type ResSeed = {
  title: string;
  description?: string;
  url?: string;
  type: ResourceType;
  category?: [CategorySection, string];
  icon?: string;
  roles?: AppRole[];
  quick?: boolean;
  pinned?: boolean;
  important?: boolean;
  owner?: string;
  docType?: string;
  keywords?: string[];
};

const PROCEDURE_NOTE = "הקישור יעודכן לנוהל המלא בתיקיית הנהלים ב-Google Drive.";

const resourceSeeds: ResSeed[] = [
  // מערכות + גישה מהירה
  {
    title: "תלם",
    description: "מערכת הדיווח והתיעוד. אירועים, יומנים ומעקב שוטף.",
    type: "system",
    category: ["systems", "core"],
    icon: "monitor",
    quick: true,
    pinned: true,
    docType: "web",
    keywords: ["תלם", "דיווח", "יומן", "אירוע"],
  },
  {
    title: "EasyShift",
    description: "סידור משמרות, החלפות ונוכחות.",
    type: "system",
    category: ["systems", "shifts"],
    icon: "calendar-clock",
    quick: true,
    docType: "web",
    keywords: ["משמרות", "סידור", "איזי שיפט", "נוכחות", "החלפה"],
  },
  {
    title: "מערכת ילמ",
    description: "כניסה למערכת ילמ.",
    type: "system",
    category: ["systems", "core"],
    icon: "layout-grid",
    quick: true,
    docType: "web",
    keywords: ["ילמ"],
  },
  {
    title: "Google Drive",
    description: "כל התיקיות והמסמכים של טוקאייר.",
    url: "https://drive.google.com",
    type: "system",
    category: ["systems", "google"],
    icon: "hard-drive",
    quick: true,
    docType: "web",
    keywords: ["דרייב", "מסמכים", "תיקייה", "drive"],
  },
  {
    title: "Gmail",
    description: "הדואר הארגוני.",
    url: "https://mail.google.com",
    type: "system",
    category: ["systems", "google"],
    icon: "mail",
    quick: true,
    docType: "web",
    keywords: ["מייל", "דואר", "gmail"],
  },
  {
    title: "Google Calendar",
    description: "יומן אישי ויומני הצוות.",
    url: "https://calendar.google.com",
    type: "system",
    category: ["systems", "google"],
    icon: "calendar",
    quick: true,
    docType: "web",
    keywords: ["יומן", "פגישות", "calendar"],
  },
  {
    title: "טפסי דיווח",
    description: "כל טפסי הדיווח במקום אחד.",
    url: "/staff/forms",
    type: "link",
    category: ["links", "general"],
    icon: "clipboard-list",
    quick: true,
    keywords: ["דיווח", "טפסים"],
  },
  {
    title: "אירוע חריג",
    description: "דיווח מהיר על אירוע חריג.",
    type: "link",
    category: ["links", "general"],
    icon: "triangle-alert",
    quick: true,
    important: true,
    keywords: ["אירוע חריג", "דיווח", "חריג"],
  },
  {
    title: "טפסי הפנימייה",
    description: "תיקיית הטפסים של הפנימייה.",
    type: "link",
    category: ["links", "general"],
    icon: "folder-open",
    quick: true,
    docType: "google_folder",
    keywords: ["טפסים", "פנימייה"],
  },
  {
    title: "נהלים",
    description: "ספר הנהלים לפי נושאים.",
    url: "/staff/procedures",
    type: "link",
    category: ["links", "general"],
    icon: "book-open",
    quick: true,
    keywords: ["נהלים", "נוהל"],
  },
  {
    title: "הדרכות",
    description: "חומרי הדרכה, מצגות וסרטונים.",
    url: "/staff/training",
    type: "link",
    category: ["links", "general"],
    icon: "graduation-cap",
    quick: true,
    keywords: ["הדרכה", "הכשרה"],
  },
  {
    title: "רשימת אנשי קשר",
    description: "טלפונים ומיילים של הצוות.",
    url: "/staff/contacts",
    type: "link",
    category: ["links", "general"],
    icon: "contact",
    quick: true,
    keywords: ["טלפון", "אנשי קשר"],
  },
  {
    title: "מוקד ותורנות",
    description: "לוח התורנויות והמוקד.",
    type: "link",
    category: ["links", "general"],
    icon: "phone-call",
    quick: true,
    docType: "google_sheet",
    keywords: ["תורנות", "מוקד", "תורן", "כונן"],
  },

  // נהלים
  {
    title: "נוהל בריחת חניך",
    description: "מה עושים כשחניך לא נמצא או יצא ללא אישור.",
    type: "procedure",
    category: ["procedures", "runaway"],
    icon: "footprints",
    pinned: true,
    important: true,
    owner: "הנהלת הכפר",
    docType: "google_doc",
    keywords: ["בריחה", "בריחת", "נעדר", "היעדרות", "חניך לא נמצא"],
  },
  {
    title: "נוהל אירוע אלימות",
    description: "התמודדות עם אירוע אלימות בין חניכים או כלפי צוות.",
    type: "procedure",
    category: ["procedures", "violence"],
    icon: "hand",
    important: true,
    owner: "הנהלת הכפר",
    docType: "google_doc",
    keywords: ["אלימות", "תקיפה", "פגיעה", "ריב"],
  },
  {
    title: "נוהל מוגנות",
    description: "עקרונות המוגנות בכפר וחובות הצוות.",
    type: "procedure",
    category: ["procedures", "protection"],
    icon: "shield-check",
    pinned: true,
    owner: "הנהלת הכפר",
    docType: "google_doc",
    keywords: ["מוגנות", "הגנה", "פגיעה"],
  },
  {
    title: "נוהל דיווח אירוע חריג",
    description: "מתי מדווחים, למי ובאיזה לוח זמנים.",
    type: "procedure",
    category: ["procedures", "incidents"],
    icon: "triangle-alert",
    owner: "הנהלת הכפר",
    docType: "google_doc",
    keywords: ["אירוע חריג", "דיווח", "תלם"],
  },
  {
    title: "נוהל חשש לאובדנות",
    description: "התנהלות הצוות במצב של חשש לפגיעה עצמית.",
    type: "procedure",
    category: ["procedures", "suicide"],
    icon: "heart-pulse",
    important: true,
    owner: "הנהלה טיפולית",
    docType: "google_doc",
    keywords: ["אובדנות", "פגיעה עצמית", "סיכון"],
  },
  {
    title: "נוהל ניהול תרופות",
    description: "קבלה, אחסון, חלוקה ותיעוד של תרופות.",
    type: "procedure",
    category: ["procedures", "medication"],
    icon: "pill",
    owner: "צוות רפואי",
    docType: "google_doc",
    roles: ["admin", "management", "medical", "counselor", "housemother"],
    keywords: ["תרופות", "חלוקת תרופות", "רפואי"],
  },
  {
    title: "נוהל יציאה וחזרה מחופשה",
    description: "הכנה ליציאה הביתה, תיאום עם ההורים והחזרה לכפר.",
    type: "procedure",
    category: ["procedures", "home-leave"],
    icon: "house",
    owner: "צוות סוציאלי",
    docType: "google_doc",
    keywords: ["חופשה", "יציאה הביתה", "חזרה", "סוף שבוע"],
  },
  {
    title: "נוהל עבודה במשמרת לילה",
    description: "סבבים, השגחה ותיעוד במשמרת לילה.",
    type: "procedure",
    category: ["procedures", "night"],
    icon: "moon",
    owner: "רכז/ת משמרות",
    docType: "google_doc",
    keywords: ["לילה", "משמרת לילה", "סבב"],
  },
  {
    title: "נוהל שימוש בטלפונים",
    description: "כללי שימוש בטלפונים ניידים בכפר.",
    type: "procedure",
    category: ["procedures", "phones"],
    icon: "smartphone",
    owner: "הנהלת הכפר",
    docType: "google_doc",
    keywords: ["טלפון", "סלולרי", "נייד"],
  },
  {
    title: "נוהל רשתות חברתיות",
    description: "מה מותר ומה אסור לפרסם, לצוות ולחניכים.",
    type: "procedure",
    category: ["procedures", "social-media"],
    icon: "message-circle",
    owner: "הנהלת הכפר",
    docType: "google_doc",
    keywords: ["רשתות", "פייסבוק", "אינסטגרם", "וואטסאפ", "פרסום", "צילום"],
  },
  {
    title: "נוהל עבודה מול הורים",
    description: "קשר שוטף עם ההורים, תיאומים ושיחות.",
    type: "procedure",
    category: ["procedures", "parents"],
    icon: "users",
    owner: "צוות סוציאלי",
    docType: "google_doc",
    keywords: ["הורים", "משפחה", "שיחה עם הורים"],
  },

  // טפסים
  {
    title: "טופס אירוע חריג",
    description: "דיווח ראשוני על אירוע חריג.",
    type: "form",
    category: ["forms", "incident"],
    icon: "triangle-alert",
    important: true,
    docType: "google_form",
    keywords: ["אירוע חריג", "דיווח", "חריג"],
  },
  {
    title: "טופס יציאה לחופשה",
    description: "אישור יציאת חניך לחופשה בבית.",
    type: "form",
    category: ["forms", "leave-out"],
    icon: "log-out",
    docType: "google_form",
    keywords: ["חופשה", "יציאה", "סוף שבוע"],
  },
  {
    title: "טופס חזרה מחופשה",
    description: "תיעוד החזרה לכפר אחרי חופשה.",
    type: "form",
    category: ["forms", "leave-return"],
    icon: "log-in",
    docType: "google_form",
    keywords: ["חופשה", "חזרה"],
  },
  {
    title: "טופס קליטת ילד",
    description: "רשימת תיוג לקליטת חניך חדש.",
    type: "form",
    category: ["forms", "intake"],
    icon: "user-plus",
    roles: ["admin", "management", "therapy", "counselor"],
    docType: "google_doc",
    keywords: ["קליטה", "חניך חדש"],
  },
  {
    title: "טופס דיווח רפואי",
    description: "דיווח לצוות הרפואי.",
    type: "form",
    category: ["forms", "medical"],
    icon: "stethoscope",
    docType: "google_form",
    keywords: ["רפואי", "אחות", "מחלה"],
  },
  {
    title: "בקשת תחזוקה",
    description: "תקלה בבית, בחדר או בציוד.",
    type: "form",
    category: ["forms", "maintenance"],
    icon: "wrench",
    docType: "google_form",
    keywords: ["תקלה", "תחזוקה", "תיקון"],
  },
  {
    title: "בקשת חופשה לעובד",
    description: "בקשה לימי חופשה.",
    type: "form",
    category: ["forms", "hr"],
    icon: "id-card",
    docType: "google_form",
    keywords: ["חופשה", "ימי חופש", "משאבי אנוש"],
  },
  {
    title: "בקשת רכש",
    description: "הזמנת ציוד וחומרים.",
    type: "form",
    category: ["forms", "purchasing"],
    icon: "shopping-cart",
    docType: "google_form",
    keywords: ["רכש", "הזמנה", "ציוד"],
  },
  {
    title: "החזר הוצאות",
    description: "הגשת קבלות להחזר.",
    type: "form",
    category: ["forms", "expenses"],
    icon: "receipt",
    docType: "google_form",
    keywords: ["החזר", "קבלה", "הוצאות"],
  },

  // מסמכים
  {
    title: "ספר הנהלים המלא",
    description: "התיקייה הראשית של ספר הנהלים.",
    type: "document",
    category: ["library", "policy"],
    icon: "book-open",
    pinned: true,
    docType: "google_folder",
    keywords: ["ספר נהלים", "נהלים"],
  },
  {
    title: "תבנית סיכום משמרת",
    description: "תבנית לסיכום משמרת.",
    type: "document",
    category: ["library", "templates"],
    icon: "file-text",
    docType: "google_doc",
    keywords: ["סיכום משמרת", "משמרת", "תבנית"],
  },
];

export const seedResources: ResourceRow[] = resourceSeeds.map((r, i) => ({
  id: uuid("2", i + 1),
  title: r.title,
  description: r.description ?? (r.type === "procedure" ? PROCEDURE_NOTE : null),
  url: r.url ?? PLACEHOLDER_URL,
  type: r.type,
  category_id: r.category ? cat(r.category[0], r.category[1]) : null,
  icon: r.icon ?? null,
  roles: r.roles ?? [],
  is_public: false,
  is_pinned: r.pinned ?? false,
  is_important: r.important ?? false,
  is_quick_access: r.quick ?? false,
  owner: r.owner ?? null,
  doc_type: r.docType ?? null,
  keywords: r.keywords ?? [],
  drive_file_id: null,
  content_updated_at: null,
  sort_order: (i + 1) * 10,
  created_by: null,
  created_at: SEED_TIME,
  updated_at: SEED_TIME,
}));

function res(title: string): string {
  const found = seedResources.find((r) => r.title === title);
  if (!found) throw new Error(`Unknown seed resource ${title}`);
  return found.id;
}

// ---------------------------------------------------------------------
// הדרכות
// ---------------------------------------------------------------------
type TrainingSeed = {
  title: string;
  summary: string;
  category: string;
  mandatory?: boolean;
  duration?: number;
  file?: boolean;
  slides?: boolean;
  video?: boolean;
  link?: boolean;
  keywords?: string[];
  createdAt?: string;
};

const trainingSeeds: TrainingSeed[] = [
  {
    title: "הדרכת עובד חדש",
    summary: "היכרות עם הכפר, המבנה, השגרה, הנהלים המרכזיים והמערכות. חובה לכל עובד בשבוע הראשון.",
    category: "new-employee",
    mandatory: true,
    duration: 90,
    slides: true,
    file: true,
    keywords: ["עובד חדש", "קליטה", "אוריינטציה"],
    createdAt: "2026-09-20T08:00:00.000Z",
  },
  {
    title: "מוגנות: עקרונות וחובות",
    summary: "מה זה מוגנות בפנימייה טיפולית, חובת דיווח והתנהלות יומיומית.",
    category: "protection",
    mandatory: true,
    duration: 60,
    slides: true,
    keywords: ["מוגנות", "חובת דיווח"],
    createdAt: "2026-09-18T08:00:00.000Z",
  },
  {
    title: "מניעת הסלמה",
    summary: "זיהוי סימנים מוקדמים, הורדת עוצמות ועבודה בצוות בזמן אמת.",
    category: "de-escalation",
    duration: 75,
    slides: true,
    video: true,
    keywords: ["הסלמה", "הרגעה", "משבר"],
  },
  {
    title: "כתיבת אירועים",
    summary: "איך כותבים תיאור אירוע עובדתי, ברור ומקצועי.",
    category: "incident-writing",
    duration: 45,
    file: true,
    keywords: ["כתיבה", "דיווח", "אירוע", "תלם"],
  },
  {
    title: "עבודה במערכת תלם",
    summary: "מדריך מעשי לעבודה השוטפת במערכת.",
    category: "talam",
    duration: 30,
    video: true,
    link: true,
    keywords: ["תלם", "מערכת"],
  },
  {
    title: "נהלי תרופות",
    summary: "חלוקה, תיעוד ובקרה. מבוסס על נוהל ניהול תרופות.",
    category: "medication",
    mandatory: true,
    duration: 40,
    slides: true,
    keywords: ["תרופות", "חלוקה"],
  },
];

export const seedTraining: TrainingRow[] = trainingSeeds.map((t, i) => ({
  id: uuid("3", i + 1),
  title: t.title,
  summary: t.summary,
  category_id: cat("training", t.category),
  file_url: t.file ? PLACEHOLDER_URL : null,
  slides_url: t.slides ? PLACEHOLDER_URL : null,
  video_url: t.video ? PLACEHOLDER_URL : null,
  link_url: t.link ? PLACEHOLDER_URL : null,
  duration_minutes: t.duration ?? null,
  is_mandatory: t.mandatory ?? false,
  roles: [],
  keywords: t.keywords ?? [],
  sort_order: (i + 1) * 10,
  created_by: null,
  created_at: t.createdAt ?? SEED_TIME,
  updated_at: t.createdAt ?? SEED_TIME,
}));

function training(title: string): string {
  const found = seedTraining.find((t) => t.title === title);
  if (!found) throw new Error(`Unknown seed training ${title}`);
  return found.id;
}

// ---------------------------------------------------------------------
// עדכונים
// ---------------------------------------------------------------------
export const seedAnnouncements: AnnouncementRow[] = [
  {
    title: "ברוכים הבאים לטוקאייר במקום אחד",
    body: "כל המערכות, הנהלים, הטפסים וההדרכות מרוכזים עכשיו במקום אחד. אם חסר קישור או שמשהו לא עובד, עדכנו את ההנהלה.",
    kind: "management" as const,
    is_important: true,
    published_at: "2026-09-24T07:00:00.000Z",
  },
  {
    title: "הדרכת עובד חדש עלתה למערכת",
    body: "המצגת והחומרים של הדרכת עובד חדש זמינים בעמוד ההדרכות.",
    kind: "training" as const,
    is_important: false,
    published_at: "2026-09-20T09:00:00.000Z",
  },
  {
    title: "דוגמה להודעה תפעולית",
    body: "כאן יופיעו הודעות שוטפות: שינויים במשמרות, תחזוקה, אירועים בכפר.",
    kind: "operational" as const,
    is_important: false,
    published_at: "2026-09-15T09:00:00.000Z",
  },
].map((a, i) => ({
  id: uuid("4", i + 1),
  ...a,
  roles: [],
  link_url: null,
  expires_at: null,
  author_id: null,
  author_name: "הנהלת הכפר",
  created_at: a.published_at,
  updated_at: a.published_at,
}));

// ---------------------------------------------------------------------
// אנשי קשר (של הצוות בלבד). מספרים ושמות להשלמה
// ---------------------------------------------------------------------
const contactSeeds: Array<Partial<ContactRow> & { full_name: string }> = [
  { full_name: "נוי רפאל לוי", role_title: "מנהל הכפר", responsibility: "ניהול הכפר", department: "הנהלה" },
  { full_name: "שם להשלמה", role_title: "מנהל/ת טיפולי/ת", responsibility: "הצוות הטיפולי", department: "טיפול" },
  { full_name: "שם להשלמה", role_title: "עובד/ת סוציאלי/ת", responsibility: "קשר עם משפחות", department: "טיפול" },
  { full_name: "שם להשלמה", role_title: "רכז/ת משמרות", responsibility: "סידור משמרות והחלפות", department: "הדרכה" },
  { full_name: "שם להשלמה", role_title: "אחות", responsibility: "תרופות ומצבים רפואיים", department: "רפואה", is_emergency: true },
  { full_name: "שם להשלמה", role_title: "תורן/ית הנהלה", responsibility: "זמינות בערב ובלילה", department: "הנהלה", is_emergency: true },
  { full_name: "שם להשלמה", role_title: "אב בית", responsibility: "תחזוקה ובטיחות", department: "מנהלה" },
  { full_name: "שם להשלמה", role_title: "מזכירות", responsibility: "מנהלה, משאבי אנוש ורכש", department: "מנהלה" },
];

export const seedContacts: ContactRow[] = contactSeeds.map((c, i) => ({
  id: uuid("5", i + 1),
  full_name: c.full_name,
  role_title: c.role_title ?? null,
  responsibility: c.responsibility ?? null,
  department: c.department ?? null,
  phone: c.phone ?? null,
  email: c.email ?? null,
  is_emergency: c.is_emergency ?? false,
  sort_order: (i + 1) * 10,
  created_at: SEED_TIME,
  updated_at: SEED_TIME,
}));

// ---------------------------------------------------------------------
// חירום: שלד בלבד. את התוכן המקצועי ממלאת ההנהלה מתוך הנהלים המאושרים
// ---------------------------------------------------------------------
const FILL_STEPS = "להשלמה: הצעדים המיידיים מתוך הנוהל המאושר.";
const FILL_DONT = "להשלמה: מה אסור לעשות, מתוך הנוהל המאושר.";
const FILL_REPORT = "להשלמה: איזה דיווח ממלאים ולמי מעבירים.";
const MGMT_ON_CALL = { label: "תורן/ית הנהלה (מספר להשלמה)", phone: "" };

const emergencySeeds: Array<{
  slug: string;
  title: string;
  icon: string;
  calls?: Array<{ label: string; phone: string }>;
  procedure?: string;
  reportForm?: boolean;
}> = [
  { slug: "runaway", title: "בריחת חניך", icon: "footprints", procedure: "נוהל בריחת חניך", reportForm: true },
  { slug: "violence", title: "אלימות", icon: "hand", procedure: "נוהל אירוע אלימות", reportForm: true },
  { slug: "suicide-risk", title: "חשש לאובדנות", icon: "heart-pulse", procedure: "נוהל חשש לאובדנות", reportForm: true },
  { slug: "medical", title: "מצב רפואי", icon: "stethoscope", calls: [{ label: "מד\"א", phone: "101" }] },
  { slug: "fire", title: "שריפה", icon: "flame", calls: [{ label: "כבאות והצלה", phone: "102" }] },
  { slug: "security", title: "אירוע ביטחוני", icon: "shield-alert", calls: [{ label: "משטרה", phone: "100" }] },
  { slug: "abuse", title: "פגיעה או חשד לפגיעה", icon: "shield-check", procedure: "נוהל מוגנות", reportForm: true },
  { slug: "mandatory-report", title: "מצב המחייב דיווח", icon: "clipboard-check", procedure: "נוהל דיווח אירוע חריג", reportForm: true },
];

export const seedEmergency: EmergencyProtocolRow[] = emergencySeeds.map((e, i) => ({
  id: uuid("6", i + 1),
  slug: e.slug,
  title: e.title,
  icon: e.icon,
  now_steps: [FILL_STEPS],
  call_list: [...(e.calls ?? []), MGMT_ON_CALL],
  dont_list: [FILL_DONT],
  report_text: FILL_REPORT,
  report_url: e.reportForm ? PLACEHOLDER_URL : null,
  procedure_id: e.procedure ? res(e.procedure) : null,
  sort_order: (i + 1) * 10,
  created_at: SEED_TIME,
  updated_at: SEED_TIME,
}));

// ---------------------------------------------------------------------
// מסלול קליטה
// ---------------------------------------------------------------------
const onboardingSeeds: Array<Partial<OnboardingItemRow> & Pick<OnboardingItemRow, "stage" | "title">> = [
  { stage: "day1", title: "פגישת היכרות עם הממונה הישיר", description: "תיאום ציפיות, שעות, ומי מלווה אותך בשבועות הראשונים." },
  { stage: "day1", title: "סיור בכפר", description: "הבתים, חדר הצוות, המרפאה, המטבח ויציאות החירום." },
  { stage: "day1", title: "קבלת הרשאות למערכות", description: "חשבון Google ארגוני, תלם ו-EasyShift." },
  { stage: "week1", title: "הדרכת עובד חדש", description: "חובה בשבוע הראשון.", training_id: training("הדרכת עובד חדש") },
  { stage: "week1", title: "משמרות חפיפה", description: "עבודה לצד איש צוות ותיק לפני משמרת עצמאית." },
  { stage: "week1", title: "קריאת נהלי החובה", description: "רשימת הנהלים מופיעה למטה בעמוד." },
  { stage: "month1", title: "שיחת משוב ראשונה", description: "מה עובד, מה קשה ומה צריך." },
  { stage: "month1", title: "השלמת הכשרות החובה", description: "מוגנות ונהלי תרופות." },
  { stage: "must_read", title: "נוהל מוגנות", resource_id: res("נוהל מוגנות") },
  { stage: "must_read", title: "נוהל דיווח אירוע חריג", resource_id: res("נוהל דיווח אירוע חריג") },
  { stage: "must_read", title: "נוהל בריחת חניך", resource_id: res("נוהל בריחת חניך") },
  { stage: "people", title: "מנהל הכפר", description: "נוי רפאל לוי" },
  { stage: "people", title: "הממונה הישיר שלך", description: "יעודכן בפגישת ההיכרות." },
  { stage: "people", title: "רכז/ת המשמרות", description: "לכל שאלה על סידור והחלפות." },
  { stage: "people", title: "הצוות הרפואי", description: "תרופות ומצבים רפואיים." },
  { stage: "systems", title: "תלם", resource_id: res("תלם") },
  { stage: "systems", title: "EasyShift", resource_id: res("EasyShift") },
  { stage: "systems", title: "Gmail ארגוני", resource_id: res("Gmail") },
  { stage: "procedures", title: "נוהל מוגנות", resource_id: res("נוהל מוגנות") },
  { stage: "procedures", title: "נוהל אירוע אלימות", resource_id: res("נוהל אירוע אלימות") },
  { stage: "procedures", title: "נוהל ניהול תרופות", resource_id: res("נוהל ניהול תרופות") },
  { stage: "trainings", title: "הדרכת עובד חדש", training_id: training("הדרכת עובד חדש") },
  { stage: "trainings", title: "מוגנות: עקרונות וחובות", training_id: training("מוגנות: עקרונות וחובות") },
];

export const seedOnboarding: OnboardingItemRow[] = onboardingSeeds.map((o, i) => ({
  id: uuid("7", i + 1),
  stage: o.stage,
  title: o.title,
  description: o.description ?? null,
  url: o.url ?? null,
  resource_id: o.resource_id ?? null,
  training_id: o.training_id ?? null,
  sort_order: (i + 1) * 10,
  created_at: SEED_TIME,
  updated_at: SEED_TIME,
}));
