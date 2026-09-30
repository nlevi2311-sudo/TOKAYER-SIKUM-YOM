import { theme } from "./theme";

/**
 * פרטי המסגרת. כל פרט שמופיע באתר הציבורי נלקח מכאן.
 * פרטי קשר ורשתות חברתיות אפשר לעדכן גם מתוך ממשק הניהול (/admin/content),
 * ואז הערך מהממשק גובר על הערך שכאן.
 *
 * שדות שמסומנים PLACEHOLDER צריך להחליף בפרטים האמיתיים.
 */
export const siteConfig = {
  name: "טוקאייר",
  shortName: "Tokayer",
  appName: "טוקאייר במקום אחד",
  appNameEn: "Tokayer Hub",
  fullName: "טוקאייר, כפר ילדים ונוער",
  organization: "קבוצת גיא",
  tagline: "בית. טיפול. חינוך. הזדמנות לצמוח.",
  description:
    "טוקאייר היא מסגרת טיפולית חינוכית פוסט אשפוזית לילדים ובני נוער. בית, טיפול רגשי, חינוך, קשר אישי וקהילה.",
  /** כתובת האתר בפרודקשן. נקבעת במשתנה סביבה NEXT_PUBLIC_SITE_URL */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "he_IL",

  /**
   * הלוגו. מחליפים את הקבצים ב-public באותו שם, בלי לגעת בקוד.
   * logo.png: הלוגו המלא (טוקאייר | קבוצת גיא), רקע שקוף
   * logo-white.png: אותו לוגו בלבן, לרקע טורקיז
   * logo-mark.png: הסמל בלבד, לאייקונים ולמסכים קטנים
   * width/height: יחס הגובה-רוחב של הקובץ (לא הגודל שבו הוא מוצג)
   */
  logo: {
    src: "/logo.png",
    white: "/logo-white.png",
    mark: "/logo-mark.png",
    wordmark: "/logo-tokayer.png",
    alt: "טוקאייר, קבוצת גיא",
    width: 873,
    height: 159,
    markWidth: 168,
    markHeight: 155,
  },

  contact: {
    // PLACEHOLDER: להחליף בפרטים האמיתיים
    phone: "00-000-0000",
    email: "info@example.com",
    address: "כתובת המסגרת תעודכן כאן",
    /** מספר WhatsApp בפורמט בינלאומי בלי + ובלי מקפים, למשל 972501234567 */
    whatsapp: "",
    /** קישור לפתיחת המיקום ב-Google Maps */
    mapsUrl: "",
    /** קישור embed של Google Maps (Share > Embed a map > src) */
    mapsEmbedUrl: "",
    /** מייל לקבלת קורות חיים */
    careersEmail: "jobs@example.com",
    /** קישור לטופס גיוס חיצוני (Google Forms וכו'). אם ריק, הכפתור פותח מייל */
    careersFormUrl: "",
  },

  social: {
    facebook: "",
    instagram: "",
    youtube: "",
    linkedin: "",
    website: "",
  },

  /** וידאו רקע אופציונלי ל-Hero. למשל "/videos/hero.mp4". אם ריק, מוצגות תמונות מתחלפות */
  heroVideo: "",

  theme,
} as const;

export type SiteConfig = typeof siteConfig;
