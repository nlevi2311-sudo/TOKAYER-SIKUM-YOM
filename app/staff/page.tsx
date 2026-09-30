import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { AnnouncementCard } from "@/components/staff/announcement-card";
import { EmergencyButton } from "@/components/staff/emergency-button";
import { ItemList } from "@/components/staff/item-list";
import { QuickAccessGrid } from "@/components/staff/quick-access-grid";
import { resourceHref } from "@/components/staff/resource-href";
import { SearchBox } from "@/components/staff/search-box";
import { DashboardSection } from "@/components/staff/section";
import { NoticeToast } from "@/components/staff/notice-toast";
import { requireStaff } from "@/lib/auth/session";
import {
  getAnnouncements,
  getEmergencyProtocols,
  getFavorites,
  getNewTrainingItems,
  getRecentItems,
  getResources,
} from "@/lib/data/staff";
import { RESOURCE_TYPE_LABELS } from "@/lib/labels";
import { formatRelative } from "@/lib/text";

export const metadata: Metadata = { title: "בית" };

const hebrewDate = new Intl.DateTimeFormat("he-IL", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jerusalem",
});

function greeting(): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Jerusalem" }).format(new Date()),
  );
  if (hour >= 5 && hour < 12) return "בוקר טוב";
  if (hour >= 12 && hour < 17) return "צהריים טובים";
  if (hour >= 17 && hour < 22) return "ערב טוב";
  return "לילה טוב";
}

export default async function StaffHomePage({ searchParams }: PageProps<"/staff">) {
  const params = await searchParams;
  const user = await requireStaff();
  const [quick, important, favorites, recent, newTraining, emergencies] = await Promise.all([
    getResources({ quickAccess: true }),
    getAnnouncements({ limit: 3 }),
    getFavorites(),
    getRecentItems(5),
    getNewTrainingItems(3),
    getEmergencyProtocols(),
  ]);

  const favoriteItems = [
    ...favorites.resources.map((r) => {
      const { href, external } = resourceHref(r);
      return {
        key: `r-${r.id}`,
        title: r.title,
        subtitle: RESOURCE_TYPE_LABELS[r.type],
        icon: r.icon,
        href,
        external,
      };
    }),
    ...favorites.training.map((t) => ({
      key: `t-${t.id}`,
      title: t.title,
      subtitle: "הדרכה",
      icon: "graduation-cap",
      href: `/staff/training#${t.id}`,
    })),
  ].slice(0, 6);

  const notice =
    params.denied === "admin"
      ? "לממשק הניהול נכנסים רק מנהלי מערכת."
      : params.notfound
        ? "הפריט לא נמצא או שאין לך הרשאה לפתוח אותו."
        : null;

  return (
    <div className="space-y-8">
      {notice ? <NoticeToast message={notice} /> : null}

      <section className="space-y-5">
        <div>
          <p className="text-sm text-muted-foreground">{hebrewDate.format(new Date())}</p>
          <h1 className="mt-1 text-3xl font-extrabold text-primary sm:text-4xl">
            {greeting()}, {user.firstName}
          </h1>
          <p className="mt-1 text-lg text-muted-foreground">מה צריך היום?</p>
        </div>
        <SearchBox />
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-8">
          <DashboardSection title="גישה מהירה" href="/staff/systems" hrefLabel="כל המערכות">
            {quick.length > 0 ? (
              <QuickAccessGrid items={quick} />
            ) : (
              <EmptyState icon="layout-grid" title="אין עדיין קיצורי דרך" description="ההנהלה מגדירה אותם בממשק הניהול." />
            )}
          </DashboardSection>

          <DashboardSection title="המועדפים שלי" href="/staff/favorites">
            {favoriteItems.length > 0 ? (
              <ItemList items={favoriteItems} />
            ) : (
              <div className="flex items-center gap-3 rounded-2xl border border-dashed bg-card px-4 py-5 text-sm text-muted-foreground">
                <Star className="size-5 shrink-0 text-highlight" aria-hidden="true" />
                <p>
                  סמנו כוכב על נוהל, טופס או מערכת והם יופיעו כאן.{" "}
                  <Link href="/staff/procedures" className="font-semibold text-primary hover:underline">
                    לנהלים
                  </Link>
                </p>
              </div>
            )}
          </DashboardSection>

          <DashboardSection title="נפתחו לאחרונה">
            {recent.length > 0 ? (
              <ItemList
                items={recent.map((r) => ({
                  key: `${r.kind}-${r.id}`,
                  title: r.title,
                  subtitle: r.typeLabel,
                  icon: r.icon,
                  href: r.href,
                  external: true,
                  meta: formatRelative(r.openedAt),
                }))}
              />
            ) : (
              <p className="rounded-2xl border border-dashed bg-card px-4 py-5 text-sm text-muted-foreground">
                כאן יופיעו חמשת הפריטים האחרונים שפתחת.
              </p>
            )}
          </DashboardSection>
        </div>

        <aside className="space-y-8">
          <EmergencyButton protocols={emergencies} variant="card" />

          <DashboardSection title="עדכונים" href="/staff/updates">
            {important.length > 0 ? (
              <div className="space-y-3">
                {important.map((a) => (
                  <AnnouncementCard key={a.id} item={a} compact />
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed bg-card px-4 py-5 text-sm text-muted-foreground">אין עדכונים חדשים.</p>
            )}
          </DashboardSection>

          {newTraining.length > 0 ? (
            <DashboardSection title="הכשרות חדשות" href="/staff/training">
              <ItemList
                items={newTraining.map((t) => ({
                  key: t.id,
                  title: t.title,
                  subtitle: t.is_mandatory ? "חובה" : t.category?.name,
                  icon: "graduation-cap",
                  href: `/staff/training#${t.id}`,
                }))}
              />
            </DashboardSection>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
