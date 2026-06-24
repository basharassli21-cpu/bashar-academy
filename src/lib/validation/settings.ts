import { z } from "zod";

export const updateSettingsSchema = z.object({
  defaultCountryCode: z
    .string()
    .trim()
    .regex(/^\d{1,4}$/, "Country code must be 1-4 digits"),
});
