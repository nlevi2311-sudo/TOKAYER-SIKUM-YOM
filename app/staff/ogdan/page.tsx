import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { OgdanBrowser } from "@/components/staff/lomda/ogdan-browser";
import { OGDAN_GATES, OGDAN_PROCEDURES } from "@/lib/content/lomda";

export const metadata: Metadata = { title: "האוגדן" };

export default function OgdanPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="אוגדן הנהלים תשפ״ז · 86 נהלים בשבעה שערים"
        title="האוגדן בכיס"
        description="כל נוהל: המטרה, מי אחראי, מתי מפעילים, איפה מתעדים ומה עושים. מחפשים מילה או בוחרים שער."
        breadcrumbs={[{ label: "בית", href: "/staff" }, { label: "האוגדן" }]}
      />
      <p className="rounded-xl border-s-4 border-highlight bg-highlight/10 px-4 py-3 text-sm">
        זו תמצית האוגדן ולא תחליף לו. האוגדן המלא הוא המסמך המחייב, ובספק עוצרים ופונים למנהל התורן.
      </p>
      <OgdanBrowser gates={OGDAN_GATES} procedures={OGDAN_PROCEDURES} />
    </div>
  );
}
