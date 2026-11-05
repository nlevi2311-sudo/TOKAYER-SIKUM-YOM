import { NextResponse } from "next/server";
import { destroySession, getCurrentUser } from "@/lib/auth";
import { audit } from "@/lib/audit";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const user = await getCurrentUser();
  if (user) await audit(user.id, url.searchParams.get("idle") ? "LOGOUT_IDLE" : "LOGOUT", "User", user.id);
  await destroySession();
  const target = new URL(url.searchParams.get("idle") ? "/login?idle=1" : "/login", url.origin);
  return NextResponse.redirect(target, { status: 303 });
}
