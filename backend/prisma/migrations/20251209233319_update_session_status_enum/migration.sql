-- Crear nuevo enum con los valores actualizados
CREATE TYPE "session_status_new" AS ENUM ('SCHEDULED', 'COMPLETED_UNCLAIMED', 'COMPLETED_AND_CLAIMED', 'CANCELLED');

-- Eliminar el valor por defecto temporalmente
ALTER TABLE "sessions" ALTER COLUMN "status" DROP DEFAULT;

-- Cambiar la columna para usar el nuevo enum, convirtiendo COMPLETED a COMPLETED_UNCLAIMED
ALTER TABLE "sessions" ALTER COLUMN "status" TYPE "session_status_new" 
  USING (
    CASE 
      WHEN "status"::text = 'COMPLETED' THEN 'COMPLETED_UNCLAIMED'::"session_status_new"
      ELSE "status"::text::"session_status_new"
    END
  );

-- Restaurar el valor por defecto con el nuevo tipo
ALTER TABLE "sessions" ALTER COLUMN "status" SET DEFAULT 'SCHEDULED'::"session_status_new";

-- Eliminar el enum antiguo
DROP TYPE "session_status";

-- Renombrar el nuevo enum al nombre original
ALTER TYPE "session_status_new" RENAME TO "session_status";

