-- CreateEnum
CREATE TYPE "reminder_type" AS ENUM ('SESSION_COMPLETED', 'PHOTOS_READY_3_MONTHS', 'PHOTOS_READY_10_MONTHS');

-- AlterTable
ALTER TABLE "reminders" ADD COLUMN "type" "reminder_type" NOT NULL DEFAULT 'SESSION_COMPLETED';
ALTER TABLE "reminders" ADD COLUMN "invoiceId" TEXT;

-- CreateIndex
CREATE INDEX "reminders_type_idx" ON "reminders"("type");
CREATE INDEX "reminders_invoiceId_idx" ON "reminders"("invoiceId");

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
