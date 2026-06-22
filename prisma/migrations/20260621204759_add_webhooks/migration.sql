-- CreateEnum
CREATE TYPE "WebhookEvent" AS ENUM ('LEAD_CREATED', 'LEAD_CLOSED_SALE', 'LEAD_ASSIGNED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'WEBHOOK_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'WEBHOOK_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'WEBHOOK_DELETED';

-- CreateTable
CREATE TABLE "webhooks" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "event" "WebhookEvent" NOT NULL,
    "secret" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_triggered_at" TIMESTAMP(3),
    "last_status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "webhooks_event_is_active_idx" ON "webhooks"("event", "is_active");
