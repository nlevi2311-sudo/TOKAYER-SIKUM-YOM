import Image from "next/image";
import type { PublicContent } from "@/config/public-content";
import { isExternalUrl } from "@/lib/text";
import { CardGrid } from "./card-grid";

type Member = PublicContent["team"]["members"][number];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

/** תחומי הצוות, ואם הוזנו גם אנשי צוות בשמם */
export function TeamGrid({ team }: { team: PublicContent["team"] }) {
  return (
    <div className="space-y-12">
      <CardGrid items={team.items} columns={3} />
      {team.members.length > 0 ? <MemberList members={team.members} /> : null}
    </div>
  );
}

function MemberList({ members }: { members: Member[] }) {
  return (
    <ul role="list" className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
      {members.map((member, i) => (
        <li key={`${member.name}-${i}`} className="text-center">
          <div className="relative mx-auto size-24 overflow-hidden rounded-full bg-brand-soft sm:size-28">
            {member.photo ? (
              <Image
                src={member.photo}
                alt={member.name}
                fill
                sizes="112px"
                className="object-cover"
                unoptimized={isExternalUrl(member.photo)}
              />
            ) : (
              <span aria-hidden="true" className="flex size-full items-center justify-center text-2xl font-bold text-primary">
                {initials(member.name)}
              </span>
            )}
          </div>
          <p className="mt-3 font-bold text-foreground">{member.name}</p>
          {member.role ? <p className="text-sm text-muted-foreground">{member.role}</p> : null}
        </li>
      ))}
    </ul>
  );
}
