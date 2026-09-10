-- 1. Tabla nueva de productores (clon de clientes)
CREATE TABLE "productores" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rut" TEXT,
    "contacto" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "notas" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productores_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "productores_rut_key" ON "productores"("rut");

-- 2. Poblar: una fila de productor por cada string distinto ya usado en lotes
INSERT INTO "productores" ("id", "nombre", "creadoEn", "actualizadoEn")
SELECT gen_random_uuid()::text, t."productor", now(), now()
FROM (SELECT DISTINCT "productor" FROM "lotes") t;

-- 3. Columna FK nullable primero, para poder poblarla desde los datos existentes
ALTER TABLE "lotes" ADD COLUMN "productorId" TEXT;

UPDATE "lotes" l SET "productorId" = p."id"
FROM "productores" p
WHERE p."nombre" = l."productor";

-- 4. Ahora sí, NOT NULL + FK real + índice
ALTER TABLE "lotes" ALTER COLUMN "productorId" SET NOT NULL;

ALTER TABLE "lotes" ADD CONSTRAINT "lotes_productorId_fkey"
  FOREIGN KEY ("productorId") REFERENCES "productores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "lotes_productorId_idx" ON "lotes"("productorId");

-- 5. Borrar la columna vieja de texto libre
ALTER TABLE "lotes" DROP COLUMN "productor";

-- 6. Resto de columnas nuevas (sin dependencias de datos)
ALTER TYPE "EtapaInspeccion" ADD VALUE 'PRESIZER' BEFORE 'POST_HIDROENFRIADO';

ALTER TABLE "inspecciones" ADD COLUMN     "informeEnviado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "presizerDistribucionCalibres" TEXT,
ADD COLUMN     "presizerDistribucionColor" TEXT,
ADD COLUMN     "presizerFalsoAceptadoPct" DOUBLE PRECISION,
ADD COLUMN     "presizerFalsoRechazoPct" DOUBLE PRECISION,
ADD COLUMN     "presizerImpactosNuevosPct" DOUBLE PRECISION,
ADD COLUMN     "presizerNumeroBin" TEXT,
ADD COLUMN     "presizerPerdidaPedicelo" TEXT;
