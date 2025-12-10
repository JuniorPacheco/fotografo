-- Crear nuevo enum con el valor adicional COMPLETED_AND_CLAIMED
CREATE TYPE "invoice_status_new" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED_PENDING_PHOTOS', 'COMPLETED_PHOTOS_READY', 'COMPLETED_AND_CLAIMED', 'CANCELLED');

-- Eliminar el valor por defecto temporalmente
ALTER TABLE "invoices" ALTER COLUMN "status" DROP DEFAULT;

-- Cambiar la columna para usar el nuevo enum
ALTER TABLE "invoices" ALTER COLUMN "status" TYPE "invoice_status_new" 
  USING ("status"::text::"invoice_status_new");

-- Restaurar el valor por defecto con el nuevo tipo
ALTER TABLE "invoices" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"invoice_status_new";

-- Eliminar el enum antiguo
DROP TYPE "invoice_status";

-- Renombrar el nuevo enum al nombre original
ALTER TYPE "invoice_status_new" RENAME TO "invoice_status";

