import "server-only";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import { triggerWebhooks } from "@/lib/webhooks";
import type { LeadStatus } from "@/generated/prisma/enums";

/**
 * The single write path for "an employee touched this lead": status change,
 * follow-up date, and call note land together so the note list stays the
 * one source of truth for call history.
 */
export async function applyLeadUpdate(params: {
  leadId: string;
  employeeId: string;
  ownerEmployeeId?: string;
  status: LeadStatus;
  note: string;
  nextFollowupDate: Date | null;
}) {
  const { leadId, employeeId, ownerEmployeeId, status, note, nextFollowupDate } = params;

  const { lead, note: leadNote, isNewlyClosed } = await prisma.$transaction(async (tx) => {
    const existing = await tx.lead.findFirst({
      where: { id: leadId, ...(ownerEmployeeId ? { ownerEmployeeId } : {}) },
      select: { closedAt: true },
    });
    if (!existing) throw new NotFoundError();

    const closedAt = status === "CLOSED_SALE" ? existing.closedAt ?? new Date() : null;
    const isNewlyClosed = status === "CLOSED_SALE" && existing.closedAt === null;

    const lead = await tx.lead.update({
      where: { id: leadId },
      data: { status, lastContactDate: new Date(), nextFollowupDate, closedAt },
    });

    const leadNote = await tx.leadNote.create({
      data: { leadId, employeeId, note, statusAtTime: status },
    });

    return { lead, note: leadNote, isNewlyClosed };
  });

  if (isNewlyClosed) {
    void triggerWebhooks("LEAD_CLOSED_SALE", { leadId: lead.id, customerName: lead.customerName });
  }

  return { lead, note: leadNote };
}
