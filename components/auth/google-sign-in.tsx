"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z" />
    </svg>
  );
}

/** כניסה עם Google דרך Supabase. אפשר להגביל לדומיין הארגוני עם NEXT_PUBLIC_GOOGLE_HOSTED_DOMAIN */
export function GoogleSignIn({ next }: { next: string }) {
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const hd = process.env.NEXT_PUBLIC_GOOGLE_HOSTED_DOMAIN;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: { prompt: "select_account", ...(hd ? { hd } : {}) },
      },
    });
    if (error) {
      setLoading(false);
      toast.error("לא הצלחנו להתחבר ל Google. נסו שוב.");
    }
  }

  return (
    <Button onClick={signIn} disabled={loading} variant="outline" className="h-12 w-full gap-3 rounded-xl text-base">
      {loading ? <Loader2 className="size-5 animate-spin" /> : <GoogleMark />}
      כניסה עם Google
    </Button>
  );
}
