import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit";
import { normalizePhone } from "@/lib/phone/normalize";
import { getAppSettings } from "@/lib/settings";
import { importLeadsSchema } from "@/lib/validation/lead-import";
import { ValidationError, errorResponseBody } from "@/lib/errors";
import { mapWithConcurrency } from "@/lib/concurrency";
import type { ImportRow, LeadStatus } from "@/lib/api/leads";

// A 5000-row import doing one row at a time, sequentially, would take
// minutes and risk the function timing out — rows are validated/normalized
// up front (cheap), existence-checked and written in concurrent batches
// (the expensive, network-bound part), with only the round-robin
// assignment kept as an in-memory sequential pass so it still only
// advances for rows that actually become new leads, exactly as before.
export const maxDuration = 60;

const CONCURRENCY = 20;

type PreparedRow = {
  index: number;
  customerName: string;
  rawPhone: string;
  phoneNormalized: string;
  row: ImportRow;
};

export async function POST(request: Request) {
  try {
    const actor = await requireApiRole(["ADMIN"]);
    const body = await request.json();
    const parsed = importLeadsSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);
    const data = parsed.data;

    let roundRobinEmployeeIds: string[] = [];

    if (data.assignmentMode === "SINGLE_EMPLOYEE") {
      const owner = await prisma.user.findUnique({ where: { id: data.assignedEmployeeId! } });
      if (!owner || owner.role !== "SALES_EMPLOYEE" || !owner.isActive) {
        throw new ValidationError("assignedEmployeeId must reference an active sales employee");
      }
    } else if (data.assignmentMode === "ROUND_ROBIN") {
      const employees = await prisma.user.findMany({
        where: { id: { in: data.employeeIds! }, role: "SALES_EMPLOYEE", isActive: true },
      });
      if (employees.length === 0) {
        throw new ValidationError("employeeIds must reference at least one active sales employee");
      }
      roundRobinEmployeeIds = employees.map((e) => e.id);
    }

    const leadImport = await prisma.leadImport.create({
      data: {
        uploadedById: actor.id,
        filename: data.filename,
        totalRows: data.rows.length,
        importedCount: 0,
        updatedCount: 0,
        skippedCount: 0,
        invalidCount: 0,
        assignmentMode: data.assignmentMode,
        assignedEmployeeId: data.assignmentMode === "SINGLE_EMPLOYEE" ? data.assignedEmployeeId : null,
      },
    });

    const settings = await getAppSettings();
    const errorReport: { row: number; reason: string; raw: ImportRow }[] = [];
    const prepared: PreparedRow[] = [];

    for (let i = 0; i < data.rows.length; i++) {
      const row = data.rows[i];
      const customerName = row.customerName.trim();
      const rawPhone = row.phone.trim();
      const digitCount = rawPhone.replace(/\D/g, "").length;

      if (!customerName || digitCount < 7) {
        errorReport.push({
          row: i + 1,
          reason: !customerName ? "missing customer name" : "invalid phone number",
          raw: row,
        });
        continue;
      }

      prepared.push({
        index: i,
        customerName,
        rawPhone,
        phoneNormalized: normalizePhone(rawPhone, settings.defaultCountryCode),
        row,
      });
    }

    const uniquePhones = Array.from(new Set(prepared.map((p) => p.phoneNormalized)));
    const existingLeads = await mapWithConcurrency(uniquePhones, CONCURRENCY, (phoneNormalized) =>
      prisma.lead.findUnique({ where: { phoneNormalized }, select: { id: true, customerName: true } })
    );
    const existingByPhone = new Map(
      uniquePhones
        .map((phone, i) => [phone, existingLeads[i]] as const)
        .filter(([, lead]) => lead !== null)
    );

    const toUpdate: { id: string; customerName: string }[] = [];
    const toCreate: (PreparedRow & { ownerEmployeeId: string | null })[] = [];
    const seenNewPhones = new Set<string>();
    let skippedCount = 0;
    let roundRobinIndex = 0;

    for (const item of prepared) {
      const existing = existingByPhone.get(item.phoneNormalized);
      if (existing) {
        if (existing.customerName !== item.customerName) {
          toUpdate.push({ id: existing.id, customerName: item.customerName });
        } else {
          skippedCount++;
        }
        continue;
      }

      // Two rows in the same file sharing a phone number that doesn't
      // exist yet — the first occurrence creates the lead, later ones are
      // treated as already handled rather than attempted as a second
      // create (which would fail the unique phoneNormalized constraint).
      if (seenNewPhones.has(item.phoneNormalized)) {
        skippedCount++;
        continue;
      }
      seenNewPhones.add(item.phoneNormalized);

      let ownerEmployeeId: string | null = null;
      if (data.assignmentMode === "SINGLE_EMPLOYEE") {
        ownerEmployeeId = data.assignedEmployeeId!;
      } else if (data.assignmentMode === "ROUND_ROBIN") {
        ownerEmployeeId = roundRobinEmployeeIds[roundRobinIndex % roundRobinEmployeeIds.length];
        roundRobinIndex++;
      }
      toCreate.push({ ...item, ownerEmployeeId });
    }

    await mapWithConcurrency(toUpdate, CONCURRENCY, (item) =>
      prisma.lead.update({ where: { id: item.id }, data: { customerName: item.customerName } })
    );

    let importedCount = 0;
    await mapWithConcurrency(toCreate, CONCURRENCY, async (item) => {
      const status: LeadStatus = item.row.status ?? "NEW";
      const lastContactDate = item.row.lastCallDate ? new Date(item.row.lastCallDate) : null;
      const nextFollowupDate = item.row.nextFollowupDate ? new Date(item.row.nextFollowupDate) : null;
      const closedAt = status === "CLOSED_SALE" ? new Date() : null;

      const createdLead = await prisma.lead.create({
        data: {
          customerName: item.customerName,
          phone: item.rawPhone,
          phoneNormalized: item.phoneNormalized,
          status,
          lastContactDate: lastContactDate && !isNaN(lastContactDate.getTime()) ? lastContactDate : null,
          nextFollowupDate: nextFollowupDate && !isNaN(nextFollowupDate.getTime()) ? nextFollowupDate : null,
          closedAt,
          ownerEmployeeId: item.ownerEmployeeId,
          createdById: actor.id,
          source: "IMPORT",
          importId: leadImport.id,
        },
      });

      // Imported call history has no specific employee attached to it yet
      // (especially for OpenC rows), so the note is attributed to the
      // importing admin rather than left orphaned.
      if (item.row.note?.trim()) {
        await prisma.leadNote.create({
          data: {
            leadId: createdLead.id,
            employeeId: actor.id,
            note: item.row.note.trim(),
            statusAtTime: status,
          },
        });
      }
      importedCount++;
    });

    const updatedCount = toUpdate.length;
    const invalidCount = errorReport.length;

    const updatedImport = await prisma.leadImport.update({
      where: { id: leadImport.id },
      data: {
        importedCount,
        updatedCount,
        skippedCount,
        invalidCount,
        errorReport: errorReport.length ? errorReport : undefined,
      },
    });

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "LEADS_IMPORTED",
      entityType: "LeadImport",
      entityId: leadImport.id,
      details: { filename: data.filename, importedCount, updatedCount, skippedCount, invalidCount },
    });

    return NextResponse.json(updatedImport, { status: 201 });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
