import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <AuthLayout>
      <div className="space-y-4 text-center">
        <p className="eyebrow">404</p>
        <h1 className="text-2xl font-extrabold text-primary">העמוד לא נמצא</h1>
        <p className="text-muted-foreground">ייתכן שהקישור השתנה או שהעמוד הוסר.</p>
        <div className="flex justify-center gap-2">
          <Button asChild className="rounded-xl">
            <Link href="/">לדף הבית</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/staff">לאזור הצוות</Link>
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
