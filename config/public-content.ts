import { z } from "zod";
import { siteConfig } from "./site";

/**
 * תוכן האתר הציבורי.
 * הערכים כאן הם ברירת המחדל. כל מה שנערך בממשק הניהול (/admin/content)
 * נשמר בטבלת public_content וגובר על ברירת המחדל.
 *
 * כדי להוסיף שדה חדש לעריכה: מוסיפים אותו לסכמה, לברירת המחדל ולרשימת השדות (contentSections).
 */

// ---------------------------------------------------------------------
// סכמות
// ---------------------------------------------------------------------
const text = (max = 300) => z.string().trim().max(max);
const optionalUrl = z
  .string()
  .trim()
  .max(1000)
  .refine((v) => v === "" || /^(https?:\/\/|\/)/i.test(v), "כתובת צריכה להתחיל ב-https:// או ב-/");

export const cardItemSchema = z.object({
  title: text(120).min(1, "חובה"),
  description: text(600),
  icon: text(60),
});

export const timelineItemSchema = z.object({
  time: text(40),
  title: text(120).min(1, "חובה"),
  description: text(400),
  icon: text(60),
});

export const galleryImageSchema = z.object({
  src: optionalUrl,
  alt: text(200),
  category: text(60),
});

export const teamMemberSchema = z.object({
  name: text(120).min(1, "חובה"),
  role: text(120),
  photo: optionalUrl,
});

export const publicContentSchemas = {
  hero: z.object({
    title: text(80),
    subtitle: text(120),
    description: text(600),
    images: z.array(optionalUrl).max(10),
    video: optionalUrl,
  }),
  about: z.object({
    title: text(80),
    body: text(4000),
    highlight: text(300),
  }),
  uniqueness: z.object({
    title: text(80),
    intro: text(600),
    items: z.array(cardItemSchema).max(16),
  }),
  day: z.object({
    title: text(80),
    intro: text(600),
    items: z.array(timelineItemSchema).max(20),
  }),
  team: z.object({
    title: text(80),
    intro: text(600),
    items: z.array(cardItemSchema).max(20),
    members: z.array(teamMemberSchema).max(60),
  }),
  therapy: z.object({
    title: text(80),
    intro: text(600),
    body: text(5000),
    momentsTitle: text(120),
    moments: z.array(cardItemSchema).max(16),
    principles: z.array(cardItemSchema).max(12),
  }),
  education: z.object({
    title: text(80),
    intro: text(600),
    body: text(5000),
    points: z.array(cardItemSchema).max(12),
  }),
  life: z.object({
    title: text(80),
    intro: text(600),
    categories: z.array(text(60)).max(20),
    images: z.array(galleryImageSchema).max(200),
  }),
  fit: z.object({
    title: text(80),
    intro: text(600),
    body: text(5000),
    points: z.array(cardItemSchema).max(12),
    note: text(600),
  }),
  careers: z.object({
    title: text(120),
    intro: text(800),
    roles: z.array(cardItemSchema).max(20),
    whyTitle: text(120),
    why: z.array(cardItemSchema).max(12),
    formUrl: optionalUrl,
    cvEmail: text(200),
  }),
  contact: z.object({
    phone: text(40),
    email: text(200),
    address: text(300),
    whatsapp: text(30),
    mapsUrl: optionalUrl,
    mapsEmbedUrl: optionalUrl,
    hours: text(200),
  }),
  social: z.object({
    facebook: optionalUrl,
    instagram: optionalUrl,
    youtube: optionalUrl,
    linkedin: optionalUrl,
    website: optionalUrl,
  }),
} as const;

export type PublicContentKey = keyof typeof publicContentSchemas;
export type PublicContent = { [K in PublicContentKey]: z.infer<(typeof publicContentSchemas)[K]> };
export type CardItem = z.infer<typeof cardItemSchema>;
export type TimelineItem = z.infer<typeof timelineItemSchema>;
export const PUBLIC_CONTENT_KEYS = Object.keys(publicContentSchemas) as PublicContentKey[];

// ---------------------------------------------------------------------
// ברירות מחדל
// ---------------------------------------------------------------------
export const defaultPublicContent: PublicContent = {
  hero: {
    title: "טוקאייר\nכפר ילדים ונוער",
    subtitle: siteConfig.tagline,
    description:
      "מסגרת טיפולית חינוכית פוסט אשפוזית. מקום שבו ילדים ובני נוער חוזרים לשגרה, לקשר וללמידה, עם מבוגרים שנמצאים שם בשבילם כל יום.",
    images: ["/images/hero-1.svg", "/images/hero-2.svg", "/images/hero-3.svg"],
    video: siteConfig.heroVideo,
  },
  about: {
    title: "מי אנחנו",
    body: "טוקאייר היא מסגרת טיפולית חינוכית פוסט אשפוזית לילדים ובני נוער הזקוקים למעטפת מקצועית, יציבה ומשמעותית.\n\nהמסגרת משלבת חיים בבית, טיפול רגשי, חינוך, קשר אישי, פנאי, קהילה ועבודה עם המשפחה.\n\nאנחנו פועלים במסגרת קבוצת גיא, עם צוות רב מקצועי שעובד יחד סביב כל ילד.",
    highlight: "אנחנו רואים את הילד כאדם שלם, ולא כאבחנה או כאירוע.",
  },
  uniqueness: {
    title: "מה מייחד את טוקאייר",
    intro: "הטיפול לא מתחיל ונגמר בחדר הטיפולים. הוא קורה בבית, בשגרה, בקשר ובהזדמנויות הקטנות של כל יום.",
    items: [
      { title: "הבית כמקום טיפולי", description: "שגרה ברורה, סדר יום צפוי ומבוגרים קבועים. הבית עצמו הוא חלק מהטיפול.", icon: "house-heart" },
      { title: "קשר משמעותי עם מבוגר", description: "לכל ילד יש מבוגרים שמכירים אותו לעומק ונשארים איתו גם ברגעים הקשים.", icon: "handshake" },
      { title: "טיפול רגשי", description: "טיפול פרטני וקבוצתי בידי אנשי מקצוע, בתיאום מלא עם הצוות בבית.", icon: "heart-handshake" },
      { title: "חינוך ולמידה", description: "חיבור הדוק לבית הספר ומרכז למידה בכפר, כדי שהלמידה תחזור להיות אפשרית.", icon: "book-open" },
      { title: "פנאי וחוויות", description: "חוגים, ספורט, מוזיקה וטיולים. מקום לגלות כישרונות ולהנות.", icon: "palette" },
      { title: "חיזוק עצמאות", description: "אחריות אישית, מיומנויות חיים וצעדים קטנים לקראת היום שאחרי.", icon: "sprout" },
      { title: "קשר עם המשפחה", description: "עבודה משותפת עם ההורים והמשפחה לאורך כל הדרך.", icon: "users" },
      { title: "חיים בתוך קהילה", description: "כפר עם חיי קהילה, חגים, פרויקטים ומסורת משותפת.", icon: "trees" },
    ],
  },
  day: {
    title: "איך נראה יום בטוקאייר",
    intro: "יום צפוי ויציב נותן ביטחון. כך בערך נראית השגרה.",
    items: [
      { time: "בוקר", title: "השכמה ובוקר בבית", description: "התארגנות, ארוחת בוקר ושיחה קצרה עם הצוות.", icon: "sunrise" },
      { time: "", title: "יציאה לבית הספר", description: "ליווי ליום הלימודים.", icon: "school" },
      { time: "צהריים", title: "חזרה הביתה", description: "קבלת פנים בבית ומבט על איך עבר היום.", icon: "house" },
      { time: "", title: "ארוחת צהריים", description: "ארוחה משותפת בבית.", icon: "utensils" },
      { time: "", title: "מנוחה", description: "זמן שקט להתאוורר.", icon: "sofa" },
      { time: "אחר הצהריים", title: "טיפול רגשי", description: "מפגשים טיפוליים לפי התוכנית של כל ילד.", icon: "heart-handshake" },
      { time: "", title: "מרכז למידה", description: "שיעורי בית ותגבור לימודי.", icon: "book-open" },
      { time: "", title: "חוגים", description: "ספורט, אומנות, מוזיקה ועוד.", icon: "palette" },
      { time: "", title: "פעילות חברתית", description: "פעילות בבית ובכפר.", icon: "users" },
      { time: "ערב", title: "ארוחת ערב", description: "סביב שולחן אחד.", icon: "soup" },
      { time: "", title: "זמן בית", description: "שיחות, משחקים וזמן יחד.", icon: "lamp" },
      { time: "לילה", title: "התארגנות לשינה", description: "סגירת היום בשקט ובביטחון.", icon: "moon" },
    ],
  },
  team: {
    title: "אנשי המקצוע",
    intro: "סביב כל ילד עובד צוות רב מקצועי שמתאם ביניהם כל הזמן.",
    items: [
      { title: "הנהלת הכפר", description: "אחריות על המסגרת, על הצוות ועל האיכות המקצועית.", icon: "compass" },
      { title: "צוות טיפולי", description: "הובלת התוכנית הטיפולית של כל ילד.", icon: "heart-handshake" },
      { title: "עובדים סוציאליים", description: "עבודה עם המשפחות ועם גורמי הרווחה.", icon: "users" },
      { title: "פסיכולוגיה", description: "אבחון, טיפול והדרכת צוות.", icon: "brain" },
      { title: "צוות חינוכי", description: "חיבור לבית הספר ולמידה בכפר.", icon: "graduation-cap" },
      { title: "מדריכים", description: "הנוכחות היומיומית בבית, בשגרה ובקשר.", icon: "handshake" },
      { title: "אמהות בית", description: "החום, הסדר והביתיות.", icon: "house-heart" },
      { title: "צוות רפואי", description: "מעקב רפואי ובריאות שוטפת.", icon: "stethoscope" },
      { title: "מנהלה ולוגיסטיקה", description: "כל מה שמאפשר לכפר לעבוד.", icon: "settings" },
    ],
    members: [],
  },
  therapy: {
    title: "התפיסה הטיפולית",
    intro: "אצלנו טיפול הוא לא רק שעה בשבוע בחדר הטיפולים. הוא הדרך שבה אנחנו חיים יחד.",
    body: "ילד שמגיע אלינו אחרי אשפוז צריך קודם כל ביטחון. ביטחון נבנה משגרה צפויה, ממבוגרים שעומדים במילה שלהם ומקשר שלא נשבר גם כשקשה.\n\nלכן אנחנו מסתכלים על כל רגע ביום כהזדמנות. ארוחה משותפת, יציאה לבית הספר, ריב בין חברים, חזרה מביקור בבית, ערב רגיל בבית או שיחה עם מדריך בסוף משמרת. כל אחד מאלה יכול להיות רגע טיפולי, אם יש לידו מבוגר שרואה אותו.\n\nהצוות הטיפולי, צוות הבית וצוות החינוך עובדים יחד סביב אותה תוכנית, כך שמה שקורה בחדר הטיפולים ממשיך בבית ולהפך.",
    momentsTitle: "רגעים טיפוליים ביומיום",
    moments: [
      { title: "ארוחה משותפת", description: "שולחן אחד, שיחה, שייכות.", icon: "utensils" },
      { title: "יציאה לבית הספר", description: "התחלה טובה של היום משנה הרבה.", icon: "school" },
      { title: "ריב", description: "הזדמנות ללמוד איך מתקנים.", icon: "message-circle" },
      { title: "חזרה מביקור בבית", description: "רגע רגיש שמקבל יחס ומקום.", icon: "house" },
      { title: "ערב בבית", description: "שקט, שגרה וביטחון.", icon: "lamp" },
      { title: "שיחה עם מדריך", description: "קשר שנבנה לאט ומחזיק.", icon: "message-square-heart" },
    ],
    principles: [
      { title: "קשר לפני הכול", description: "שינוי קורה בתוך מערכת יחסים יציבה.", icon: "handshake" },
      { title: "צוות אחד", description: "טיפול, בית וחינוך מדברים באותה שפה.", icon: "users" },
      { title: "המשפחה שותפה", description: "ההורים הם חלק מהתהליך ולא צופים מהצד.", icon: "heart" },
    ],
  },
  education: {
    title: "חינוך ולמידה",
    intro: "הרבה מהילדים שמגיעים אלינו התרחקו מהלמידה. המטרה שלנו היא להחזיר אותם אליה.",
    body: "הילדים לומדים במסגרות חינוכיות, ואנחנו עובדים בקשר רציף עם הצוות בבית הספר. מה שקורה בכיתה ידוע בבית, ומה שקורה בבית ידוע בכיתה.\n\nבכפר פועל מרכז למידה שבו הילדים מכינים שיעורי בית, מקבלים תגבור ולומדים בקצב שלהם. הצלחה קטנה בלמידה היא לפעמים הצעד הראשון בחזרה לביטחון עצמי.",
    points: [
      { title: "קשר רציף עם בית הספר", description: "תיאום שוטף בין הכיתה לבית.", icon: "school" },
      { title: "מרכז למידה בכפר", description: "שיעורי בית, תגבור ולמידה אישית.", icon: "book-open" },
      { title: "יעדים אישיים", description: "כל ילד עם יעדים שמתאימים לו.", icon: "target" },
      { title: "חיזוק הצלחות", description: "רואים ומציינים כל התקדמות.", icon: "sparkles" },
    ],
  },
  life: {
    title: "החיים בטוקאייר",
    intro: "חגים, טיולים, חוגים, ספורט, מוזיקה ופרויקטים. החיים עצמם הם חלק מהטיפול.",
    categories: ["פעילויות", "חגים", "טיולים", "חוגים", "ספורט", "מוזיקה", "פרויקטים", "קהילה"],
    images: [],
  },
  fit: {
    title: "למי טוקאייר מתאימה",
    intro: "טוקאייר היא מסגרת טיפולית פוסט אשפוזית לילדים ובני נוער שזקוקים למעטפת טיפולית וחינוכית אחרי אשפוז או במצבים שמחייבים מסגרת מחזיקה.",
    body: "כל פנייה נבחנת באופן מקצועי ואישי. ההחלטה על התאמה מתקבלת אחרי היכרות עם הילד, עם המשפחה ועם הגורמים המפנים, ובהתאם לתהליכי ההפניה המקובלים.\n\nבאתר הזה אין מידע קליני ואין פרטים על ילדים. לשאלות על תהליך הפנייה אפשר ליצור קשר.",
    points: [
      { title: "אחרי אשפוז", description: "ילדים ובני נוער שסיימו אשפוז וזקוקים למסגרת מחזיקה.", icon: "sprout" },
      { title: "מעטפת רב מקצועית", description: "מי שזקוק לשילוב של טיפול, בית וחינוך.", icon: "users" },
      { title: "תהליך אישי", description: "בחינת התאמה מקצועית, עם המשפחה והגורמים המפנים.", icon: "clipboard-check" },
    ],
    note: "פניות מגורמים מקצועיים ומשפחות מתקבלות דרך עמוד יצירת הקשר.",
  },
  careers: {
    title: "מחפשים עבודה עם משמעות אמיתית?",
    intro: "אנחנו מחפשים אנשים שרוצים להיות מבוגר משמעותי בחיים של ילד. אנשים עם סבלנות, אחריות ולב פתוח. מקבלים הדרכה צמודה, צוות תומך ועבודה שרואים את התוצאות שלה.",
    roles: [
      { title: "מדריכים", description: "הנוכחות היומיומית בבית ובשגרה של הילדים.", icon: "handshake" },
      { title: "עובדים סוציאליים", description: "עבודה עם ילדים, משפחות וגורמי רווחה.", icon: "users" },
      { title: "אמהות בית", description: "הלב של הבית: חום, סדר וביתיות.", icon: "house-heart" },
      { title: "מטפלים", description: "טיפול רגשי פרטני וקבוצתי.", icon: "heart-handshake" },
      { title: "אנשי חינוך", description: "מרכז הלמידה והקשר עם בתי הספר.", icon: "graduation-cap" },
      { title: "סטודנטים ומתמחים", description: "התנסות מעשית בליווי והדרכה מקצועית.", icon: "book-open" },
    ],
    whyTitle: "למה לעבוד איתנו",
    why: [
      { title: "הדרכה וליווי", description: "הדרכות קבועות וליווי מקצועי.", icon: "graduation-cap" },
      { title: "צוות תומך", description: "לא עובדים לבד.", icon: "users" },
      { title: "משמעות", description: "עבודה שמשנה חיים.", icon: "heart" },
    ],
    formUrl: siteConfig.contact.careersFormUrl,
    cvEmail: siteConfig.contact.careersEmail,
  },
  contact: {
    phone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    address: siteConfig.contact.address,
    whatsapp: siteConfig.contact.whatsapp,
    mapsUrl: siteConfig.contact.mapsUrl,
    mapsEmbedUrl: siteConfig.contact.mapsEmbedUrl,
    hours: "",
  },
  social: { ...siteConfig.social },
};

// ---------------------------------------------------------------------
// הגדרת טופסי העריכה בממשק הניהול
// ---------------------------------------------------------------------
export type ContentFieldType = "text" | "textarea" | "url" | "lines" | "cards" | "timeline" | "gallery" | "members";

export type ContentField = {
  name: string;
  label: string;
  type: ContentFieldType;
  help?: string;
};

export type ContentSection = {
  key: PublicContentKey;
  title: string;
  description: string;
  /** איפה זה מופיע באתר */
  path: string;
  fields: ContentField[];
};

export const contentSections: ContentSection[] = [
  {
    key: "hero",
    title: "דף הבית: כותרת ראשית",
    description: "הכותרת, כותרת המשנה והתמונות המתחלפות בראש דף הבית.",
    path: "/",
    fields: [
      { name: "title", label: "כותרת ראשית", type: "textarea", help: "שורה חדשה = ירידת שורה בכותרת" },
      { name: "subtitle", label: "כותרת משנה", type: "text" },
      { name: "description", label: "פסקת פתיחה", type: "textarea" },
      { name: "images", label: "תמונות מתחלפות", type: "lines", help: "כתובת תמונה בכל שורה. למשל /images/hero-1.jpg" },
      { name: "video", label: "וידאו רקע (אופציונלי)", type: "url", help: "אם מוגדר, מוצג במקום התמונות" },
    ],
  },
  {
    key: "about",
    title: "מי אנחנו",
    description: "הפסקה שמציגה את טוקאייר.",
    path: "/#about",
    fields: [
      { name: "title", label: "כותרת", type: "text" },
      { name: "body", label: "טקסט", type: "textarea", help: "שורה ריקה = פסקה חדשה" },
      { name: "highlight", label: "משפט מודגש", type: "text" },
    ],
  },
  {
    key: "uniqueness",
    title: "הייחוד של טוקאייר",
    description: "כרטיסי הייחודיות בדף הבית.",
    path: "/#uniqueness",
    fields: [
      { name: "title", label: "כותרת", type: "text" },
      { name: "intro", label: "פתיח", type: "textarea" },
      { name: "items", label: "כרטיסים", type: "cards" },
    ],
  },
  {
    key: "day",
    title: "איך נראה היום",
    description: "ציר הזמן של סדר היום.",
    path: "/#day",
    fields: [
      { name: "title", label: "כותרת", type: "text" },
      { name: "intro", label: "פתיח", type: "textarea" },
      { name: "items", label: "שלבי היום", type: "timeline" },
    ],
  },
  {
    key: "team",
    title: "אנשי המקצוע",
    description: "תחומי הצוות, ובהמשך גם אנשי צוות בשמם.",
    path: "/#team",
    fields: [
      { name: "title", label: "כותרת", type: "text" },
      { name: "intro", label: "פתיח", type: "textarea" },
      { name: "items", label: "תחומים", type: "cards" },
      { name: "members", label: "אנשי צוות (אופציונלי)", type: "members", help: "אם הרשימה ריקה, לא מוצגים שמות" },
    ],
  },
  {
    key: "therapy",
    title: "טיפול",
    description: "עמוד התפיסה הטיפולית.",
    path: "/therapy",
    fields: [
      { name: "title", label: "כותרת", type: "text" },
      { name: "intro", label: "פתיח", type: "textarea" },
      { name: "body", label: "טקסט", type: "textarea", help: "שורה ריקה = פסקה חדשה" },
      { name: "momentsTitle", label: "כותרת הרגעים הטיפוליים", type: "text" },
      { name: "moments", label: "רגעים טיפוליים", type: "cards" },
      { name: "principles", label: "עקרונות", type: "cards" },
    ],
  },
  {
    key: "education",
    title: "חינוך",
    description: "עמוד החינוך והלמידה.",
    path: "/education",
    fields: [
      { name: "title", label: "כותרת", type: "text" },
      { name: "intro", label: "פתיח", type: "textarea" },
      { name: "body", label: "טקסט", type: "textarea" },
      { name: "points", label: "נקודות מרכזיות", type: "cards" },
    ],
  },
  {
    key: "life",
    title: "החיים בטוקאייר",
    description: "הגלריה וקטגוריות הפעילות.",
    path: "/life",
    fields: [
      { name: "title", label: "כותרת", type: "text" },
      { name: "intro", label: "פתיח", type: "textarea" },
      { name: "categories", label: "קטגוריות", type: "lines", help: "קטגוריה בכל שורה" },
      {
        name: "images",
        label: "תמונות",
        type: "gallery",
        help: "רק תמונות שיש אישור לפרסם. בלי פנים מזוהות של ילדים.",
      },
    ],
  },
  {
    key: "fit",
    title: "למי טוקאייר מתאימה",
    description: "מידע כללי למשפחות ולגורמים מפנים. בלי מידע קליני.",
    path: "/fit",
    fields: [
      { name: "title", label: "כותרת", type: "text" },
      { name: "intro", label: "פתיח", type: "textarea" },
      { name: "body", label: "טקסט", type: "textarea" },
      { name: "points", label: "נקודות", type: "cards" },
      { name: "note", label: "הערה בתחתית", type: "textarea" },
    ],
  },
  {
    key: "careers",
    title: "הצטרפות לצוות",
    description: "עמוד הגיוס.",
    path: "/careers",
    fields: [
      { name: "title", label: "כותרת", type: "text" },
      { name: "intro", label: "פתיח", type: "textarea" },
      { name: "roles", label: "תפקידים", type: "cards" },
      { name: "whyTitle", label: "כותרת למה לעבוד איתנו", type: "text" },
      { name: "why", label: "למה לעבוד איתנו", type: "cards" },
      { name: "formUrl", label: "קישור לטופס גיוס", type: "url", help: "אם ריק, הכפתור פותח מייל" },
      { name: "cvEmail", label: "מייל לקורות חיים", type: "text" },
    ],
  },
  {
    key: "contact",
    title: "פרטי קשר",
    description: "טלפון, מייל, כתובת, WhatsApp ומפה.",
    path: "/contact",
    fields: [
      { name: "phone", label: "טלפון", type: "text" },
      { name: "email", label: "מייל", type: "text" },
      { name: "address", label: "כתובת", type: "text" },
      { name: "hours", label: "שעות מענה", type: "text" },
      { name: "whatsapp", label: "WhatsApp", type: "text", help: "פורמט בינלאומי בלי + ובלי מקפים, למשל 972501234567" },
      { name: "mapsUrl", label: "קישור ל-Google Maps", type: "url" },
      { name: "mapsEmbedUrl", label: "קישור הטמעה של המפה", type: "url", help: "Google Maps > שיתוף > הטמעת מפה > הכתובת שבתוך src" },
    ],
  },
  {
    key: "social",
    title: "רשתות חברתיות",
    description: "הקישורים בתחתית האתר.",
    path: "/",
    fields: [
      { name: "facebook", label: "Facebook", type: "url" },
      { name: "instagram", label: "Instagram", type: "url" },
      { name: "youtube", label: "YouTube", type: "url" },
      { name: "linkedin", label: "LinkedIn", type: "url" },
      { name: "website", label: "אתר קבוצת גיא", type: "url" },
    ],
  },
];

/** ממזג ערך מבסיס הנתונים עם ברירת המחדל. ערך לא תקין נזנח. */
export function mergeContent<K extends PublicContentKey>(key: K, stored: unknown): PublicContent[K] {
  const base = defaultPublicContent[key];
  if (!stored || typeof stored !== "object") return base;
  const merged = { ...base, ...(stored as Record<string, unknown>) };
  const parsed = publicContentSchemas[key].safeParse(merged);
  return parsed.success ? (parsed.data as PublicContent[K]) : base;
}
