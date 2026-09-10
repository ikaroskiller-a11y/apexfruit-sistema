-- CreateEnum
CREATE TYPE "CalidadMuestra" AS ENUM ('A', 'B', 'C');

-- AlterTable
ALTER TABLE "defectos" ADD COLUMN     "muestraId" TEXT;

-- AlterTable
ALTER TABLE "fotos" ADD COLUMN     "muestraId" TEXT;

-- CreateTable
CREATE TABLE "muestras" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "embalaje" TEXT NOT NULL,
    "etiqueta" TEXT,
    "calibre" TEXT,
    "nFrutos" INTEGER,
    "pesoKg" DOUBLE PRECISION,
    "nSalida" TEXT,
    "embaladora" TEXT,
    "sinPLU" INTEGER,
    "conPLU" INTEGER,
    "sobreCalibrePct" DOUBLE PRECISION,
    "bajoCalibrePct" DOUBLE PRECISION,
    "notaApertura" TEXT,
    "notaEmbalaje" TEXT,
    "hora" TEXT,
    "calidad" "CalidadMuestra" NOT NULL DEFAULT 'A',
    "condicion" INTEGER NOT NULL DEFAULT 1,
    "causaCalidad" TEXT,
    "causaCondicion" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "inspeccionId" TEXT NOT NULL,

    CONSTRAINT "muestras_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "muestras_inspeccionId_idx" ON "muestras"("inspeccionId");

-- CreateIndex
CREATE UNIQUE INDEX "muestras_inspeccionId_numero_key" ON "muestras"("inspeccionId", "numero");

-- CreateIndex
CREATE INDEX "defectos_muestraId_idx" ON "defectos"("muestraId");

-- CreateIndex
CREATE INDEX "fotos_muestraId_idx" ON "fotos"("muestraId");

-- AddForeignKey
ALTER TABLE "muestras" ADD CONSTRAINT "muestras_inspeccionId_fkey" FOREIGN KEY ("inspeccionId") REFERENCES "inspecciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "defectos" ADD CONSTRAINT "defectos_muestraId_fkey" FOREIGN KEY ("muestraId") REFERENCES "muestras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fotos" ADD CONSTRAINT "fotos_muestraId_fkey" FOREIGN KEY ("muestraId") REFERENCES "muestras"("id") ON DELETE CASCADE ON UPDATE CASCADE;
