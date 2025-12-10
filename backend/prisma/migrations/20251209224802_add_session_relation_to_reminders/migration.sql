-- AlterTable
ALTER TABLE "reminders" ADD COLUMN "sessionId" TEXT;

-- CreateIndex
CREATE INDEX "reminders_sessionId_idx" ON "reminders"("sessionId");

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

