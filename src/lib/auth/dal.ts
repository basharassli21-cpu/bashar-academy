import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { readSessionFromCookies } from "./session";
import { prisma } from "@/lib/prisma";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";
import type { Role } from "@/generated/prisma/enums";

// Optimistic: cookie only, no DB hit. Safe for quick UI branching but
// must never be the sole gate for a sensitive read/write.
export const verifySession = cache(async () => {
  return readSessionFromCookies();
});

export type CurrentUser = {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  teamLeaderId: string | null;
  monthlyTarget: number | null;
  totpEnabled: boolean;
  notificationsMuted: boolean;
  notificationDigestMode: boolean;
};

// Secure: re-reads the live row from the database (catches deactivation,
// role changes, etc. that a 7-day-old JWT claim would not reflect).
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await verifySession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      username: true,
      fullName: true,
      role: true,
      teamLeaderId: true,
      monthlyTarget: true,
      totpEnabled: true,
      notificationsMuted: true,
      notificationDigestMode: true,
      isActive: true,
      sessionVersion: true,
    },
  });

  if (!user || !user.isActive) return null;
  if (user.sessionVersion !== session.sessionVersion) return null;
  return user;
});

function roleHome(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "TEAM_LEADER":
      return "/team-leader";
    case "SALES_EMPLOYEE":
      return "/sales";
    case "STUDENT":
      return "/academy";
  }
}

/** For Server Components / pages: redirects rather than throwing. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(roles: Role[]): Promise<CurrentUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect(roleHome(user.role));
  return user;
}

/** For Route Handlers: throws typed errors instead of redirecting. */
export async function requireApiUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

export async function requireApiRole(roles: Role[]): Promise<CurrentUser> {
  const user = await requireApiUser();
  if (!roles.includes(user.role)) throw new ForbiddenError();
  return user;
}
