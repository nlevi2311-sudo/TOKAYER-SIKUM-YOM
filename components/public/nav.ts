export type NavItem = { href: string; label: string };

/** הניווט הראשי של האתר הציבורי. משמש בכותרת, בתפריט הנייד ובתחתית */
export const publicNav: NavItem[] = [
  { href: "/#about", label: "מי אנחנו" },
  { href: "/therapy", label: "טיפול" },
  { href: "/education", label: "חינוך" },
  { href: "/life", label: "החיים בכפר" },
  { href: "/fit", label: "למי מתאים" },
  { href: "/careers", label: "הצטרפות לצוות" },
  { href: "/contact", label: "צור קשר" },
];

export const staffEntry: NavItem = { href: "/staff", label: "כניסת צוות" };

/** נתיב פעיל: התאמה מלאה או תת נתיב. קישורי עוגן בדף הבית לא מסומנים */
export function isActivePath(pathname: string, href: string): boolean {
  if (href.includes("#")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
