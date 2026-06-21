import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit";
import { normalizePhone } from "@/lib/phone/normalize";
import { importLeadsSchema } from "@/lib/validation/lead-import";
import { ValidationError, errorResponseBody } from "@/lib/errors";

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

    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let invalidCount = 0;
    let roundRobinIndex = 0;
    const errorReport: { row: number; reason: string; raw: { customerName: string; phone: string } }[] = [];

    for (let i = 0; i < data.rows.length; i++) {
      const row = data.rows[i];
      const customerName = row.customerName.trim();
      const rawPhone = row.phone.trim();
      const digitCount = rawPhone.replace(/\D/g, "").length;

      if (!customerName || digitCount < 7) {
        invalidCount++;
        errorReport.push({
          row: i + 1,
          reason: !customerName ? "missing customer name" : "invalid phone number",
          raw: row,
        });
        continue;
      }

      const phoneNormalized = normalizePhone(rawPhone);
      const existing = await prisma.lead.findUnique({ where: { phoneNormalized } });

      if (existing) {
        if (existing.customerName !== customerName) {
          await prisma.lead.update({ where: { id: existing.id }, data: { customerName } });
          updatedCount++;
        } else {
          skippedCount++;
        }
        continue;
      }

      let ownerEmployeeId: string | null = null;
      if (data.assignmentMode === "SINGLE_EMPLOYEE") {
        ownerEmployeeId = data.assignedEmployeeId!;
      } else if (data.assignmentMode === "ROUND_ROBIN") {
        ownerEmployeeId = roundRobinEmployeeIds[roundRobinIndex % roundRobinEmployeeIds.length];
        roundRobinIndex++;
      }

      await prisma.lead.create({
        data: {
          customerName,
          phone: rawPhone,
          phoneNormalized,
          ownerEmployeeId,
          createdById: actor.id,
          source: "IMPORT",
          importId: leadImport.id,
        },
      });
      importedCount++;
    }

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
