import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // כל הנתיבים חוץ מקבצים סטטיים, תמונות וקבצי PWA
    "/((?!_next/static|_next/image|favicon.ico|icons/|images/|logo.png|sw.js|offline.html|manifest.webmanifest|robots.txt|sitemap.xml|shift-summary/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm)$).*)",
  ],
};
