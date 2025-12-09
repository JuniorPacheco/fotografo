/*
  Warnings:

  - You are about to drop the column `isSingleSession` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `paidAmount` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the `selected_photos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "selected_photos" DROP CONSTRAINT "selected_photos_sessionId_fkey";

-- AlterTable
ALTER TABLE "invoices" DROP COLUMN "isSingleSession",
DROP COLUMN "paidAmount",
ADD COLUMN     "maxNumberSessions" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "photosFolderPath" TEXT;

-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "selectedPhotos" TEXT[];

-- DropTable
DROP TABLE "selected_photos";
