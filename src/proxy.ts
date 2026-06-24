import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decryptSession } from "@/lib/auth/session";
import type { Role } from "@/generated/prisma/enums";

const roleHome: Record<Role, string> = {
  ADMIN: "/admin",
  TEAM_LEADER: "/team-leader",
  SALES_EMPLOYEE: "/sales",
  STUDENT: "/academy",
};

const protectedPrefixes: Record<string, Role> = {
  "/admin": "ADMIN",
  "/team-leader": "TEAM_LEADER",
  "/sales": "SALES_EMPLOYEE",
  "/academy": "STUDENT",
};

// Optimistic check only (cookie, no DB) — fast redirect for UX. Every
// page and API route independently re-verifies against the database
// (see src/lib/auth/dal.ts) since this alone is not a security boundary.
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await decryptSession(request.cookies.get("session")?.value);

  const matchedPrefix = Object.keys(protectedPrefixes).find(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (matchedPrefix) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const requiredRole = protectedPrefixes[matchedPrefix];
    if (session.role !== requiredRole) {
      return NextResponse.redirect(new URL(roleHome[session.role], request.url));
    }
  }

  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL(roleHome[session.role], request.url));
  }

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(session ? roleHome[session.role] : "/login", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
