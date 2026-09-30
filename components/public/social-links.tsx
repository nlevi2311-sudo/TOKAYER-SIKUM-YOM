import type { PublicContent } from "@/config/public-content";
import { cn } from "@/lib/utils";

const labels: Record<keyof PublicContent["social"], string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  website: "קבוצת גיא",
};

export function socialEntries(social: PublicContent["social"]) {
  return (Object.keys(labels) as Array<keyof PublicContent["social"]>)
    .filter((key) => social[key])
    .map((key) => ({ key, label: labels[key], href: social[key] }));
}

/** קישורים לרשתות החברתיות. רק מה שהוגדר מוצג */
export function SocialLinks({ social, className }: { social: PublicContent["social"]; className?: string }) {
  const entries = socialEntries(social);
  if (entries.length === 0) return null;
  return (
    <ul role="list" className={cn("flex flex-wrap gap-2", className)}>
      {entries.map((entry) => (
        <li key={entry.key}>
          <a
            href={entry.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-full border border-current/25 px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-white/10"
          >
            {entry.label}
            <span className="sr-only"> (נפתח בלשונית חדשה)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
