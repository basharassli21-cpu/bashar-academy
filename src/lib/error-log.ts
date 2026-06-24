import "server-only";
import { prisma } from "@/lib/prisma";

// Fire-and-forget on purpose — logging a failure must never itself throw or
// delay the error response already being returned to the caller.
export function recordErrorLog(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack ?? null : null;
  void prisma.errorLog.create({ data: { message, stack } }).catch(() => {});
}
