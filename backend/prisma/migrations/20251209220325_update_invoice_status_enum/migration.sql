-- Crear nuevo enum con los valores actualizados
CREATE TYPE "invoice_status_new" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED_PENDING_PHOTOS', 'COMPLETED_PHOTOS_READY', 'CANCELLED');

-- Cambiar la columna para usar el nuevo enum, convirtiendo COMPLETED a COMPLETED_PENDING_PHOTOS
ALTER TABLE "invoices" ALTER COLUMN "status" TYPE "invoice_status_new" 
  USING (
    CASE 
      WHEN "status"::text = 'COMPLETED' THEN 'COMPLETED_PENDING_PHOTOS'::"invoice_status_new"
      ELSE "status"::text::"invoice_status_new"
    END
  );

-- Eliminar el enum antiguo
DROP TYPE "invoice_status";

-- Renombrar el nuevo enum al nombre original
ALTER TYPE "invoice_status_new" RENAME TO "invoice_status";
