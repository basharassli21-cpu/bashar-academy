-- AlterTable
ALTER TABLE "users" ADD COLUMN     "notification_digest_mode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notifications_muted" BOOLEAN NOT NULL DEFAULT false;
