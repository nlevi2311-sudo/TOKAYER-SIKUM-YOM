import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ServiceWorkerRegister } from "@/components/shared/service-worker-register";
import { siteConfig } from "@/config/site";
import { themeToCssVars } from "@/config/theme";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.fullName} | ${siteConfig.organization}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  appleWebApp: {
    capable: true,
    title: siteConfig.name,
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.fullName,
    title: siteConfig.fullName,
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  themeColor: siteConfig.theme.themeColor,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} h-full`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeToCssVars() }} />
      </head>
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          דלג לתוכן הראשי
        </a>
        <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
        <Toaster />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
