import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { Role } from "@/generated/prisma/enums";

const SESSION_COOKIE = "session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const PENDING_2FA_COOKIE = "pending_2fa";
const PENDING_2FA_DURATION_MS = 5 * 60 * 1000; // 5 minutes

const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
  throw new Error("JWT_SECRET environment variable is not set");
}
const encodedKey = new TextEncoder().encode(secretKey);

export type SessionPayload = {
  userId: string;
  // Denormalized for optimistic checks only (e.g. in proxy.ts redirects).
  // Never use this field for actual authorization decisions — always
  // re-fetch the live role/isActive from the database for that.
  role: Role;
  // Snapshot of User.sessionVersion at issuance. getCurrentUser() rejects
  // a token whose version doesn't match the live row, so changing a
  // password invalidates every other outstanding session immediately
  // instead of waiting out the 7-day expiry.
  sessionVersion: number;
};

export async function encryptSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_MS / 1000}s`)
    .sign(encodedKey);
}

export async function decryptSession(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedKey, { algorithms: ["HS256"] });
    if (
      typeof payload.userId !== "string" ||
      typeof payload.role !== "string" ||
      typeof payload.sessionVersion !== "number"
    ) {
      return null;
    }
    return { userId: payload.userId, role: payload.role as Role, sessionVersion: payload.sessionVersion };
  } catch {
    return null;
  }
}

export async function createSessionCookie(payload: SessionPayload) {
  const token = await encryptSession(payload);
  const expires = new Date(Date.now() + SESSION_DURATION_MS);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires,
    path: "/",
  });
}

export async function deleteSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function readSessionFromCookies(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return decryptSession(token);
}

/**
 * Issued after a correct password but before a correct 2FA code: proves
 * "this request already knows the password for this account" without
 * granting a real session. Short-lived and single-purpose so it can't be
 * mistaken for (or replayed as) a full session token.
 */
export async function createPending2faCookie(userId: string) {
  const token = await new SignJWT({ userId, purpose: "2fa_pending" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${PENDING_2FA_DURATION_MS / 1000}s`)
    .sign(encodedKey);
  const cookieStore = await cookies();
  cookieStore.set(PENDING_2FA_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: PENDING_2FA_DURATION_MS / 1000,
    path: "/",
  });
}

export async function readPending2faUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PENDING_2FA_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedKey, { algorithms: ["HS256"] });
    if (payload.purpose !== "2fa_pending" || typeof payload.userId !== "string") return null;
    return payload.userId;
  } catch {
    return null;
  }
}

export async function deletePending2faCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(PENDING_2FA_COOKIE);
}
