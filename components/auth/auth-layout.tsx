import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { PathMotif } from "@/components/brand/path-motif";

/** מסך ממורכז למסכי כניסה והרשאה */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main id="main" className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-brand-soft px-4 py-10">
      <PathMotif className="absolute -end-40 -top-40 size-[34rem] opacity-70" />
      <PathMotif className="absolute -bottom-48 -start-40 size-[30rem] rotate-180 opacity-50" />
      <div className="relative w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Logo height={40} priority />
        </div>
        <div className="rounded-3xl border bg-card p-6 shadow-xl shadow-primary/5 sm:p-8">{children}</div>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary hover:underline">
            לאתר הציבורי
          </Link>
        </p>
      </div>
    </main>
  );
}
