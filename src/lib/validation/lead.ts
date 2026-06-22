import { z } from "zod";

export const leadStatusValues = [
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "NOT_INTERESTED",
  "CLOSED_SALE",
  "CANCELLED",
] as const;

export const createLeadSchema = z.object({
  customerName: z.string().trim().min(1),
  phone: z.string().trim().min(5),
  ownerEmployeeId: z.string().nullish(),
});

export const updateLeadSchema = z.object({
  status: z.enum(leadStatusValues),
  note: z.string().trim().min(1),
  nextFollowupDate: z
    .union([z.string().min(1), z.null()])
    .optional()
    .transform((val) => (val ? new Date(val) : null)),
});

export const updateLeadTagsSchema = z.object({
  tags: z.array(z.string().trim().min(1).max(40)).max(20),
});

export const transferLeadSchema = z.object({
  employeeId: z.string().min(1),
});

export const bulkTransferLeadsSchema = z.object({
  leadIds: z.array(z.string().min(1)).min(1),
  employeeId: z.string().min(1),
});

export const bulkDeleteLeadsSchema = z.object({
  leadIds: z.array(z.string().min(1)).min(1),
});
