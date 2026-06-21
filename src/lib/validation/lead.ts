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

export const transferLeadSchema = z.object({
  employeeId: z.string().min(1),
});
