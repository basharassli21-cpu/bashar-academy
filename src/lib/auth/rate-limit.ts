import "server-only";
import { prisma } from "@/lib/prisma";
import { TooManyRequestsError } from "@/lib/errors";

const WINDOW_MS = 15 * 60 * 1000;
const IP_THRESHOLD = 15;
const ACCOUNT_THRESHOLD = 5;

export async function checkIpLoginRateLimit(ipAddress: string | null) {
  if (!ipAddress) return;
  const count = await prisma.auditLog.count({
    where: {
      action: "LOGIN_FAILED",
      ipAddress,
      createdAt: { gte: new Date(Date.now() - WINDOW_MS) },
    },
  });
  if (count >= IP_THRESHOLD) throw new TooManyRequestsError();
}

export async function checkAccountLoginRateLimit(userId: string) {
  const count = await prisma.auditLog.count({
    where: {
      action: "LOGIN_FAILED",
      actorUserId: userId,
      createdAt: { gte: new Date(Date.now() - WINDOW_MS) },
    },
  });
  if (count >= ACCOUNT_THRESHOLD) throw new TooManyRequestsError();
}
