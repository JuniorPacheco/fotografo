-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "invoice_status" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED_PENDING_PHOTOS', 'COMPLETED_PHOTOS_READY', 'COMPLETED_AND_CLAIMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "session_status" AS ENUM ('SCHEDULED', 'COMPLETED_UNCLAIMED', 'COMPLETED_AND_CLAIMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "payment_method" AS ENUM ('CASH', 'TRANSFER', 'CARD', 'OTHER');

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('OWNER', 'ADMIN', 'PHOTOGRAPHER', 'ASSISTANT', 'VIEWER');

-- CreateEnum
CREATE TYPE "reminder_type" AS ENUM ('SESSION_COMPLETED', 'PHOTOS_READY_3_MONTHS', 'PHOTOS_READY_10_MONTHS');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "user_role" NOT NULL DEFAULT 'OWNER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "email" TEXT,
    "cedula" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "suggestedPrice" DECIMAL(10,2) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "packageId" TEXT,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "status" "invoice_status" NOT NULL DEFAULT 'PENDING',
    "maxNumberSessions" INTEGER NOT NULL DEFAULT 1,
    "photosFolderPath" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "sessionNumber" INTEGER NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "status" "session_status" NOT NULL DEFAULT 'SCHEDULED',
    "selectedPhotos" TEXT[],
    "notes" TEXT,
    "googleEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" "payment_method" NOT NULL DEFAULT 'CASH',
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "google_tokens" (
    "id" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "calendarId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "google_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "clientName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "reminder_type" NOT NULL,
    "invoiceId" TEXT,
    "sessionId" TEXT,
    "sentAt" TIMESTAMP(3),
    "isSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE INDEX "clients_deletedAt_idx" ON "clients"("deletedAt");

-- CreateIndex
CREATE INDEX "packages_deletedAt_idx" ON "packages"("deletedAt");

-- CreateIndex
CREATE INDEX "invoices_clientId_idx" ON "invoices"("clientId");

-- CreateIndex
CREATE INDEX "invoices_packageId_idx" ON "invoices"("packageId");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "sessions_invoiceId_idx" ON "sessions"("invoiceId");

-- CreateIndex
CREATE INDEX "sessions_scheduledAt_idx" ON "sessions"("scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_invoiceId_sessionNumber_key" ON "sessions"("invoiceId", "sessionNumber");

-- CreateIndex
CREATE INDEX "payments_invoiceId_idx" ON "payments"("invoiceId");

-- CreateIndex
CREATE INDEX "payments_paymentDate_idx" ON "payments"("paymentDate");

-- CreateIndex
CREATE INDEX "reminders_date_idx" ON "reminders"("date");

-- CreateIndex
CREATE INDEX "reminders_isSent_idx" ON "reminders"("isSent");

-- CreateIndex
CREATE INDEX "reminders_type_idx" ON "reminders"("type");

-- CreateIndex
CREATE INDEX "reminders_invoiceId_idx" ON "reminders"("invoiceId");

-- CreateIndex
CREATE INDEX "reminders_sessionId_idx" ON "reminders"("sessionId");

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

