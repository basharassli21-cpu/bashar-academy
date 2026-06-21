import { z } from "zod";

export const importLeadsSchema = z
  .object({
    filename: z.string().trim().min(1),
    rows: z
      .array(z.object({ customerName: z.string(), phone: z.string() }))
      .min(1)
      .max(5000),
    assignmentMode: z.enum(["SINGLE_EMPLOYEE", "ROUND_ROBIN", "OPENC"]),
    assignedEmployeeId: z.string().nullish(),
    employeeIds: z.array(z.string()).nullish(),
  })
  .refine(
    (data) => {
      if (data.assignmentMode === "SINGLE_EMPLOYEE") return !!data.assignedEmployeeId;
      if (data.assignmentMode === "ROUND_ROBIN") return !!data.employeeIds?.length;
      return true;
    },
    { message: "Missing the required assignment target for the selected mode" }
  );

export const distributeLeadsSchema = z.object({
  employeeIds: z.array(z.string()).min(1),
});
