import "server-only";
import { db } from "./db";

export async function getMyOpenShift(userId: string) {
  return db.shift.findFirst({ where: { managerId: userId, status: "OPEN" }, orderBy: { startedAt: "desc" } });
}

/** המשמרת האחרונה שנסגרה, לצורך העברת משמרת */
export async function lastClosedShift() {
  return db.shift.findFirst({
    where: { status: "CLOSED" },
    orderBy: { endedAt: "desc" },
    include: { manager: true, exceptions: { include: { child: true } } },
  });
}
