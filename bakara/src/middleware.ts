import { NextResponse, type NextRequest } from "next/server";

// בדיקה ראשונית בלבד: אין עוגיית כניסה, מעבירים למסך הכניסה.
// האימות המלא (תוקף, חוסר פעילות, הרשאות) נעשה בשרת בכל עמוד ופעולה.
export function middleware(req: NextRequest) {
  if (!req.cookies.get("bakara_session")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|logout|_next|favicon.ico|icon|logo|manifest).*)"],
};
