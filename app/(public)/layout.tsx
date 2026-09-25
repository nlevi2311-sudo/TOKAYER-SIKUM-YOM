import { getPublicContent } from "@/lib/data/public-content";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const content = await getPublicContent();
  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter content={content} />
    </div>
  );
}
