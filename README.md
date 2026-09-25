# טוקאייר במקום אחד (Tokayer Hub)

אפליקציית Web לכפר הילדים והנוער טוקאייר, קבוצת גיא. מערכת אחת עם שני אזורים נפרדים:

* **אתר ציבורי** (פתוח לכולם): מי אנחנו, הייחוד, סדר היום, אנשי המקצוע, טיפול, חינוך, החיים בכפר, למי מתאים, גיוס ויצירת קשר.
* **אזור צוות** (`/staff`, רק לעובדים מאושרים): גישה מהירה למערכות, חיפוש, נהלים, טפסים, מרכז מסמכים, הדרכות, מסלול קליטה, אנשי קשר, עדכונים, מועדפים וכפתור חירום.
* **ממשק ניהול** (`/admin`, רק לאדמין): עריכת כל התוכן בלי לגעת בקוד.

> האפליקציה לא שומרת מידע אישי, רפואי או טיפולי על חניכים. מסמכים רגישים נשארים במערכות המקוריות, והאפליקציה רק מפנה אליהם.

## טכנולוגיה

Next.js 16 (App Router) · TypeScript strict · Tailwind CSS 4 · shadcn/ui · Lucide · Supabase (בסיס נתונים, הרשאות, Google Login) · React Hook Form + Zod · PWA · פריסה ב Vercel.

## מבנה הפרויקט

```
app/
  (public)/          האתר הציבורי (דף הבית, טיפול, חינוך, החיים בטוקאייר, למי מתאים, גיוס, יצירת קשר)
  staff/             אזור הצוות (מוגן)
    open/[kind]/[id] פתיחת פריט: רישום ב"אחרונים" והפניה למסמך המקורי
  admin/             ממשק הניהול (אדמין בלבד)
  auth/callback/     חזרה מ Google אחרי התחברות
  login/ unauthorized/ setup/
  manifest.ts robots.ts sitemap.ts
components/
  ui/                רכיבי shadcn/ui
  public/ staff/ admin/ shared/ brand/ auth/
config/
  site.ts            פרטי המסגרת, טלפון, מייל, כתובת, WhatsApp, מפה, רשתות, לוגו
  theme.ts           צבעי המותג. מקום אחד לשינוי צבעים
  public-content.ts  טקסטי ברירת המחדל של האתר הציבורי והגדרות עריכתם
lib/
  supabase/          לקוחות Supabase (שרת, דפדפן, proxy)
  auth/              בדיקת משתמש והרשאות בצד השרת
  data/              שליפת נתונים (עם RLS)
  actions/           Server Actions (ניהול, מועדפים, חיפוש, יציאה)
  validations/       סכמות Zod
  seed-data.ts       נתוני הדוגמה (מקור אחד ל seed ולמצב הדגמה)
supabase/
  migrations/        סכמת בסיס הנתונים, RLS, פונקציית חיפוש
  seed.sql           נתוני דוגמה (נוצר אוטומטית)
types/ hooks/ public/ proxy.ts
```

## התקנה והרצה מקומית

דרישות: Node.js 20.9 ומעלה.

```bash
npm install
cp .env.example .env.local
npm run dev
```

האתר עולה בכתובת http://localhost:3000.

**רוצים לראות את אזור הצוות לפני שמחברים Supabase?** ב `.env.local` משאירים את משתני Supabase ריקים ומגדירים `NEXT_PUBLIC_DEMO_MODE=true`. אזור הצוות וממשק הניהול ייפתחו עם נתוני הדוגמה, בלי התחברות. מועדפים ו"אחרונים" עובדים (נשמרים בדפדפן), ושמירה בממשק הניהול מציגה הודעה שזה מצב הדגמה. ברגע ש Supabase מוגדר, מצב ההדגמה נכבה אוטומטית.

פקודות:

| פקודה | מה עושה |
| --- | --- |
| `npm run dev` | שרת פיתוח |
| `npm run build` | בנייה לפרודקשן |
| `npm run start` | הרצת הבנייה |
| `npm run lint` | ESLint |
| `npm run typecheck` | בדיקת TypeScript |
| `npm run seed:generate` | יצירת `supabase/seed.sql` מתוך `lib/seed-data.ts` |

## משתני סביבה

| משתנה | חובה | הסבר |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | כן | כתובת האתר בפרודקשן, למשל `https://tokayer.org.il`. משמש ל SEO, Open Graph ו sitemap |
| `NEXT_PUBLIC_SUPABASE_URL` | כן | Supabase > Project Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | כן | Supabase > Project Settings > API > anon / publishable key |
| `NEXT_PUBLIC_GOOGLE_HOSTED_DOMAIN` | לא | מציג ב Google רק חשבונות מהדומיין הארגוני. נוחות בלבד, לא הרשאה |
| `NEXT_PUBLIC_DEMO_MODE` | לא | `true` להדגמה בלי Supabase. בפרודקשן `false` |

המפתח הציבורי של Supabase בטוח לשימוש בדפדפן. ההגנה על המידע היא ה Row Level Security בבסיס הנתונים. **אין צורך ב service role key והוא לא אמור להופיע בפרויקט.** אין לשמור ערכים אמיתיים בקוד או ב git.

## חיבור Supabase

1. יוצרים פרויקט ב https://supabase.com (אזור מומלץ: Frankfurt, הקרוב לישראל).
2. ב SQL Editor מריצים לפי הסדר:
   * את הקובץ `supabase/migrations/20260925000001_initial_schema.sql` (טבלאות, אינדקסים, RLS, פונקציות).
   * את הקובץ `supabase/seed.sql` (נתוני דוגמה בעברית. אפשר לדלג אם מתחילים ריק).
3. מעתיקים את ה Project URL וה anon key למשתני הסביבה.

לחלופין, עם Supabase CLI: `npx supabase link --project-ref <ref>` ואז `npx supabase db push`.

## יצירת Google OAuth

1. ב https://console.cloud.google.com יוצרים פרויקט (או משתמשים בקיים של הארגון).
2. APIs & Services > OAuth consent screen: סוג **Internal** אם יש Google Workspace ארגוני (רק חשבונות הארגון יוכלו להתחבר), אחרת External. שם האפליקציה: טוקאייר.
3. APIs & Services > Credentials > Create credentials > OAuth client ID > Web application.
4. ב Authorized redirect URIs מוסיפים את הכתובת שמופיעה ב Supabase תחת Authentication > Providers > Google (בצורה `https://<project-ref>.supabase.co/auth/v1/callback`).
5. מעתיקים את Client ID ו Client Secret ל Supabase > Authentication > Providers > Google ומפעילים.
6. ב Supabase > Authentication > URL Configuration:
   * Site URL: כתובת האתר בפרודקשן.
   * Redirect URLs: `https://<הדומיין>/auth/callback` וגם `http://localhost:3000/auth/callback` לפיתוח.

## הרשאות: איך זה עובד

* כל מי שמתחבר עם Google מקבל רשומה בטבלת `profiles`.
* המשתמש **פעיל** (`active = true`) רק אם המייל שלו או הדומיין שלו מופיעים בטבלת `access_allowlist`, או שאדמין אישר אותו ידנית.
* משתמש לא פעיל רואה: "החשבון שלך אינו מורשה להיכנס לאזור הצוות."
* ההרשאות נבדקות בשלוש שכבות: ה proxy מפנה משתמש לא מחובר לכניסה, כל layout ופעולת שרת בודקים פרופיל פעיל ותפקיד, ו RLS בבסיס הנתונים חוסם גישה גם אם מישהו עוקף את הממשק.
* תפקידים: `admin`, `management`, `therapy`, `education`, `counselor`, `housemother`, `medical`, `office`, `staff`.
* לכל קישור, נוהל, טופס, הדרכה והודעה אפשר להגדיר אילו תפקידים רואים אותו. בלי סימון: כל הצוות. אדמין רואה הכל.

### הוספת Admin ראשון

1. נכנסים לאתר ומתחברים עם Google (יופיע מסך "אינו מורשה", זה תקין).
2. ב Supabase > SQL Editor מריצים:

```sql
update public.profiles
set role = 'admin', active = true
where email = 'your.email@example.com';
```

3. נכנסים שוב. מעכשיו יש גישה ל `/admin`.

### הוספת משתמשים

שלוש דרכים, כולן מ `/admin/users`:

* **דומיין מאושר**: מוסיפים את הדומיין הארגוני (למשל `tokayer.org.il`) עם תפקיד ברירת מחדל. כל מי שמתחבר עם מייל מהדומיין מאושר אוטומטית.
* **מייל מאושר**: מוסיפים כתובת ספציפית (למשל עובד עם Gmail פרטי) ותפקיד.
* **אישור ידני**: עובד שהתחבר ומחכה מופיע בראש רשימת המשתמשים. לוחצים "אישור" ובוחרים תפקיד.

גם הסרת גישה נעשית שם: מכבים את המתג "פעיל".

## ניהול תוכן

הכל מ `/admin`, בלי לערוך קוד:

* **הוספת קישור או מערכת**: ממשק ניהול > משאבים וקישורים > פריט חדש. בוחרים סוג (מערכת, נוהל, טופס, מסמך, קישור), קטגוריה, אייקון, תפקידים מורשים. מסמנים "גישה מהירה" כדי שיופיע בדף הבית של הצוות.
* **כתובת**: קישור מלא (למשל לקובץ ב Google Drive) או נתיב פנימי שמתחיל ב `/` (למשל `/staff/forms`).
* **מילים לחיפוש**: מילים נוספות שעובדים עשויים לחפש. למשל לנוהל בריחת חניך: `בריחה, נעדר, היעדרות`.
* **נהלים, טפסים, הדרכות, הודעות, אנשי קשר, כרטיסי חירום, מסלול קליטה**: כל אחד בעמוד משלו, עם הוספה, עריכה, מחיקה (עם אישור) ושינוי סדר.
* **תוכן האתר הציבורי**: ממשק ניהול > תוכן האתר. כותרת דף הבית, מי אנחנו, ייחודיות, טיפול, חינוך, גלריה, גיוס, פרטי קשר ורשתות חברתיות.
* **כרטיסי חירום**: יש להזין רק הנחיות מאושרות מתוך ספר הנהלים. כרגע הם מכילים שלד בלבד ("להשלמה").

פריטים שעדיין מצביעים לכתובת זמנית (`https://example.com/replace-me`) מסומנים "קישור זמני", ומופיעים ברשימה בעמוד הראשי של ממשק הניהול.

## Google Drive

בשלב זה המסמכים לא מועתקים לאפליקציה. לכל פריט נשמר הקישור למסמך המקורי, כך שתמיד נפתחת הגרסה העדכנית, והרשאות Drive ממשיכות לחול. בטבלת `resources` יש שדה `drive_file_id` שמוכן לחיבור עתידי ל Google Drive API (למשל סנכרון תאריך עדכון או שם הקובץ אוטומטית).

## מיתוג

* **לוגו**: מחליפים את הקבצים ב `public/` באותם שמות: `logo.png` (לוגו מלא, רקע שקוף), `logo-white.png` (לבן, לרקע טורקיז), `logo-mark.png` (הסמל). אם יחס הגובה והרוחב משתנה, מעדכנים `width` ו `height` ב `config/site.ts`. הקבצים הנוכחיים נחתכו מתמונה ברזולוציה נמוכה. מומלץ להחליף בקבצי המקור.
* **אייקוני אפליקציה**: `public/icons/` ו `app/icon.png`, `app/apple-icon.png`.
* **צבעים**: `config/theme.ts` לפי ספר המותג של קבוצת גיא (Deep Teal כעוגן, כתום וצהוב במינון נמוך).
* **פונט**: ספר המותג מגדיר Fb Coherenti Sans (פונט בתשלום). עד שיש רישיון, Heebo משמש כחלופה. כשיש קבצי woff2: שמים אותם ב `public/fonts/` ומוסיפים `@font-face` בשם `"Fb Coherenti Sans"` בראש `app/globals.css`. הפונט ייכנס לשימוש אוטומטית.
* **תמונות**: `public/images/hero-*.svg` הם ציורים זמניים. מחליפים בתמונות אמיתיות דרך ממשק הניהול (תוכן האתר > כותרת ראשית). רק תמונות שיש אישור לפרסם, בלי פנים מזוהות של ילדים.

## פריסה ל Vercel

1. מעלים את הקוד ל GitHub (כבר שם).
2. ב https://vercel.com: Add New > Project > בוחרים את ה repository. Framework: Next.js (מזוהה אוטומטית).
3. ב Environment Variables מגדירים את `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ואופציונלית `NEXT_PUBLIC_GOOGLE_HOSTED_DOMAIN`).
4. Deploy.
5. מחברים דומיין (Settings > Domains), מעדכנים את `NEXT_PUBLIC_SITE_URL`, ומוסיפים את כתובת ה callback של הדומיין ב Supabase (ראו למעלה).

## התקנה בטלפון (PWA)

* **אייפון**: פותחים את האתר בספארי > כפתור השיתוף > "הוספה למסך הבית".
* **אנדרואיד**: בכרום מופיעה הצעה להתקנה, או תפריט (שלוש נקודות) > "התקנת אפליקציה".
* בעמוד הפרופיל באזור הצוות יש כפתור התקנה והסבר.

האפליקציה המותקנת נפתחת ישירות לאזור הצוות. מטעמי פרטיות, דפי אזור הצוות לא נשמרים בזיכרון המכשיר. בלי חיבור מוצג מסך "אין חיבור".

## אבטחה ופרטיות

* אזור הצוות וממשק הניהול מסומנים `noindex` וחסומים ב robots.txt.
* כל פעולת ניהול נבדקת בשרת (Zod + בדיקת אדמין) ובבסיס הנתונים (RLS).
* כתובות מאומתות: רק `https://`, `mailto:`, `tel:` או נתיב פנימי. אין אפשרות להזין `javascript:`.
* משתמש לא יכול לשנות לעצמו תפקיד או סטטוס. אדמין לא יכול להסיר מעצמו הרשאת אדמין.
* אין שמירה של אבחונים, מידע רפואי, דוחות, תיקים אישיים או תוכניות טיפול.

## קבצים ישנים

קבצי כלי סיכום המשמרת הקודם (`index.html`, `manifest.json`, `sw.js`, `icon-*.png` בתיקייה הראשית) נשארו במקומם ולא נגעתי בהם. הם לא חלק מאפליקציית Next.js ולא מוגשים על ידה. אפשר להעביר אותם ל `public/shift-summary/` כדי שימשיכו לעבוד בכתובת `/shift-summary/index.html`, או למחוק אם כבר לא בשימוש.
