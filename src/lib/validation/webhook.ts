import { z } from "zod";

export const webhookEventValues = ["LEAD_CREATED", "LEAD_CLOSED_SALE", "LEAD_ASSIGNED"] as const;

const httpsUrl = z
  .string()
  .trim()
  .url()
  .refine((url) => url.startsWith("https://"), { message: "url must use https://" });

export const createWebhookSchema = z.object({
  url: httpsUrl,
  event: z.enum(webhookEventValues),
});

export const updateWebhookSchema = z.object({
  url: httpsUrl.optional(),
  event: z.enum(webhookEventValues).optional(),
  isActive: z.boolean().optional(),
});
