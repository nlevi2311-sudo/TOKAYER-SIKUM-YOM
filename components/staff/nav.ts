import type { IconName } from "@/lib/icons";

export type NavItem = { href: string; label: string; icon: IconName };

export const STAFF_NAV_MAIN: NavItem[] = [
  { href: "/staff", label: "בית", icon: "house" },
  { href: "/staff/updates", label: "עדכונים", icon: "megaphone" },
  { href: "/staff/favorites", label: "המועדפים שלי", icon: "star" },
];

export const STAFF_NAV_CONTENT: NavItem[] = [
  { href: "/staff/procedures", label: "נהלים", icon: "book-open" },
  { href: "/staff/forms", label: "טפסים", icon: "clipboard-list" },
  { href: "/staff/systems", label: "מערכות", icon: "layout-grid" },
  { href: "/staff/library", label: "מרכז מסמכים", icon: "folder-open" },
  { href: "/staff/training", label: "הדרכות", icon: "graduation-cap" },
  { href: "/staff/onboarding", label: "עובד חדש", icon: "sparkles" },
  { href: "/staff/contacts", label: "אנשי קשר", icon: "contact" },
];

/** הניווט התחתון במובייל: חמשת היעדים הנפוצים */
export const STAFF_BOTTOM_NAV: NavItem[] = [
  { href: "/staff", label: "בית", icon: "house" },
  { href: "/staff/search", label: "חיפוש", icon: "search" },
  { href: "/staff/library", label: "מסמכים", icon: "folder-open" },
  { href: "/staff/systems", label: "מערכות", icon: "layout-grid" },
  { href: "/staff/profile", label: "פרופיל", icon: "user-round" },
];

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/staff") return pathname === "/staff";
  return pathname === href || pathname.startsWith(`${href}/`);
}
