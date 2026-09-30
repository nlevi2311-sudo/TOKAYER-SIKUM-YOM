import Link from "next/link";
import { IconBadge } from "@/components/shared/icon-badge";
import { isPlaceholderUrl } from "@/lib/text";
import type { Resource } from "@/types";
import { resourceHref } from "./resource-href";

/** גישה מהירה: כפתורים גדולים. הכתובות מגיעות מבסיס הנתונים */
export function QuickAccessGrid({ items }: { items: Resource[] }) {
  return (
    <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3 xl:grid-cols-5">
      {items.map((item) => {
        const { href, external } = resourceHref(item);
        const placeholder = isPlaceholderUrl(item.url);
        return (
          <li key={item.id}>
            <Link
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener" : undefined}
              prefetch={external ? false : undefined}
              title={placeholder ? "הקישור עדיין לא עודכן" : item.description ?? undefined}
              className="card-lift relative flex h-full min-h-[104px] flex-col items-center justify-center gap-2 rounded-2xl border bg-card px-2 py-4 text-center"
            >
              <IconBadge name={item.icon} size="md" tone={item.is_important ? "warm" : "teal"} />
              <span className="text-[13px] font-semibold leading-tight sm:text-sm">{item.title}</span>
              {placeholder ? (
                <span className="absolute end-2 top-2 size-2 rounded-full bg-highlight" aria-label="קישור זמני" />
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
