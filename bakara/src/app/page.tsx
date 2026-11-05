import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await requireUser();
  redirect(user.role === "DUTY" ? "/shift" : "/dashboard");
}
