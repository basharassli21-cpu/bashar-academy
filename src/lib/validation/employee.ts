import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_]{3,20}$/, "Username must be 3-20 characters: letters, numbers, underscore");

export const createEmployeeSchema = z.object({
  username: usernameSchema,
  password: z.string().min(6),
  fullName: z.string().trim().min(1),
  role: z.enum(["SALES_EMPLOYEE", "TEAM_LEADER"]),
  monthlyTarget: z.coerce.number().int().positive().nullish(),
  teamLeaderId: z.string().nullish(),
});

export const updateEmployeeSchema = z.object({
  fullName: z.string().trim().min(1).optional(),
  monthlyTarget: z.coerce.number().int().positive().nullish(),
  newPassword: z.union([z.string().min(6), z.literal("")]).optional(),
  teamLeaderId: z.string().nullish(),
});

export const assignEmployeeSchema = z.object({
  employeeId: z.string().min(1),
});
