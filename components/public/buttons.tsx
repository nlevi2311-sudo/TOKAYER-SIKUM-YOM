import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  outline: "border border-primary/25 bg-white text-primary hover:border-primary/50 hover:bg-brand-soft",
  highlight: "bg-highlight text-foreground hover:brightness-105",
  white: "bg-white text-primary hover:bg-white/90",
  ghostWhite: "border border-white/40 text-white hover:bg-white/10",
} as const;

export type PublicButtonVariant = keyof typeof variants;

export function publicButtonClass(variant: PublicButtonVariant = "primary", className?: string) {
  return cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-2.5 text-base font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 [&_svg]:size-[18px] [&_svg]:shrink-0",
    variant === "white" || variant === "ghostWhite" ? "focus-visible:outline-white" : "focus-visible:outline-ring",
    variants[variant],
    className,
  );
}

/** כפתור קישור לאתר הציבורי. קישור חיצוני נפתח בלשונית חדשה */
export function ButtonLink({
  href,
  variant = "primary",
  external,
  className,
  children,
  ...props
}: {
  href: string;
  variant?: PublicButtonVariant;
  external?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<"a">, "href" | "className" | "children">) {
  const cls = publicButtonClass(variant, className);
  const isPlainAnchor = external || /^(https?:|mailto:|tel:)/i.test(href);
  if (isPlainAnchor) {
    return (
      <a
        href={href}
        className={cls}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...props}>
      {children}
    </Link>
  );
}
