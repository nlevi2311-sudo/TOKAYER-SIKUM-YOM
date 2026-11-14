import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/public/page-hero";
import { Container } from "@/components/public/section";
import { publicMetadata } from "@/components/public/seo";

export const metadata: Metadata = publicMetadata({
  title: "מדיניות פרטיות",
  description: "איזה מידע נשמר באתר ובאזור הצוות של כפר הילדים והנוער טוקאייר, ולמה.",
  path: "/privacy",
});

const SECTIONS: Array<{ title: string; points: string[] }> = [
  {
    title: "האתר הציבורי",
    points: [
      "האתר הציבורי לא מבקש פרטים אישיים ולא שומר אותם.",
      "פנייה שנשלחת אלינו בטלפון, במייל או בוואטסאפ מטופלת בערוצים האלה, לא באתר.",
    ],
  },
  {
    title: "אזור הצוות",
    points: [
      "אזור הצוות מיועד לעובדי הכפר בלבד. הכניסה אליו נעשית עם חשבון גוגל.",
      "בכניסה נשמרים שם, כתובת מייל ותמונת הפרופיל מחשבון הגוגל, כדי לזהות את העובד ולתת לו את ההרשאות שלו.",
      "נשמרים גם פריטים שהעובד סימן כמועדפים, פריטים שפתח לאחרונה וההתקדמות שלו בלומדת הקליטה.",
      "את ההתקדמות בלומדה רואים העובד עצמו וההנהלה בלבד.",
    ],
  },
  {
    title: "מה לא נשמר",
    points: [
      "האפליקציה לא שומרת שום מידע על חניכים: לא שמות, לא אבחנות, לא מידע רפואי ולא תיקים אישיים.",
      "מסמכים ונהלים נשארים במערכות המקוריות שלהם. האפליקציה רק מפנה אליהם.",
      "המידע לא נמכר ולא מועבר לגורם אחר, ולא משמש לפרסום.",
    ],
  },
  {
    title: "איפה המידע נשמר",
    points: [
      "המידע נשמר בבסיס נתונים מאובטח של Supabase באירופה, עם הרשאות שמאפשרות לכל עובד לגשת רק למידע שלו.",
      "עובד שמסיים לעבוד בכפר מוסר מהמערכת, והמידע שלו נמחק לפי בקשה.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="פרטיות" title="מדיניות פרטיות" intro="מה נשמר באתר ובאזור הצוות של כפר הילדים והנוער טוקאייר, ולמה." />
      <section className="py-12 sm:py-16">
        <Container className="max-w-3xl space-y-8">
          {SECTIONS.map((s) => (
            <div key={s.title} className="space-y-3">
              <h2 className="text-2xl font-extrabold text-primary">{s.title}</h2>
              <ul className="list-disc space-y-2 ps-5">
                {s.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
          <p className="text-muted-foreground">
            לשאלות בנושא פרטיות או לבקשת מחיקת מידע אפשר לפנות אלינו דרך{" "}
            <Link href="/contact" className="font-semibold text-primary hover:underline">
              עמוד יצירת הקשר
            </Link>
            .
          </p>
        </Container>
      </section>
    </>
  );
}
