import type { SessionUser } from "@/types";

/** משתמש ההדגמה. פעיל רק כש-NEXT_PUBLIC_DEMO_MODE=true ואין חיבור ל-Supabase */
export const DEMO_USER: SessionUser = {
  id: "00000000-0000-4000-8000-000000000de0",
  email: "demo@example.com",
  fullName: "נוי רפאל לוי",
  firstName: "נוי",
  avatarUrl: null,
  role: "admin",
  active: true,
  isAdmin: true,
  isDemo: true,
};
