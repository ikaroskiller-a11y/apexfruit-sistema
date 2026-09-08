/*
  Warnings:

  - You are about to drop the column `firmezaKgF` on the `inspecciones` table. All the data in the column will be lost.
  - You are about to drop the column `destino` on the `lotes` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_inspecciones" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calibre" TEXT,
    "color" TEXT,
    "colorPorcentajeDark" INTEGER,
    "colorPorcentajeLight" INTEGER,
    "firmeza" REAL,
    "firmezaUnidad" TEXT,
    "brixGrados" REAL,
    "acidez" REAL,
    "pesoMuestraKg" REAL,
    "muestraCajas" INTEGER,
    "muestraUnidades" INTEGER,
    "hidrocoolerTempAguaC" REAL,
    "hidrocoolerCloroLibrePpm" REAL,
    "hidrocoolerTiempoExposicionMin" REAL,
    "hidrocoolerTempPulpaPostC" REAL,
    "hidrocoolerEsperaMasDeUnaHora" BOOLEAN,
    "porcentajeRechazo" REAL,
    "resultado" TEXT NOT NULL DEFAULT 'CATEGORIA_1',
    "observaciones" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    "loteId" TEXT NOT NULL,
    "inspectorId" TEXT NOT NULL,
    CONSTRAINT "inspecciones_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "lotes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "inspecciones_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_inspecciones" ("acidez", "actualizadoEn", "brixGrados", "calibre", "color", "creadoEn", "fecha", "id", "inspectorId", "loteId", "muestraCajas", "muestraUnidades", "observaciones", "pesoMuestraKg", "porcentajeRechazo", "resultado") SELECT "acidez", "actualizadoEn", "brixGrados", "calibre", "color", "creadoEn", "fecha", "id", "inspectorId", "loteId", "muestraCajas", "muestraUnidades", "observaciones", "pesoMuestraKg", "porcentajeRechazo", "resultado" FROM "inspecciones";
DROP TABLE "inspecciones";
ALTER TABLE "new_inspecciones" RENAME TO "inspecciones";
CREATE INDEX "inspecciones_loteId_idx" ON "inspecciones"("loteId");
CREATE INDEX "inspecciones_inspectorId_idx" ON "inspecciones"("inspectorId");
CREATE INDEX "inspecciones_fecha_idx" ON "inspecciones"("fecha");
CREATE TABLE "new_lotes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "especie" TEXT NOT NULL,
    "variedad" TEXT NOT NULL,
    "productor" TEXT NOT NULL,
    "ubicacionPacking" TEXT NOT NULL,
    "temporada" TEXT NOT NULL,
    "fechaCosecha" DATETIME,
    "fechaIngreso" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cajasTotales" INTEGER,
    "kgTotales" REAL,
    "calibrePredominante" TEXT,
    "mercadoDestino" TEXT,
    "notas" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    "clienteId" TEXT NOT NULL,
    CONSTRAINT "lotes_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_lotes" ("actualizadoEn", "cajasTotales", "calibrePredominante", "clienteId", "codigo", "creadoEn", "especie", "fechaCosecha", "fechaIngreso", "id", "kgTotales", "notas", "productor", "temporada", "ubicacionPacking", "variedad") SELECT "actualizadoEn", "cajasTotales", "calibrePredominante", "clienteId", "codigo", "creadoEn", "especie", "fechaCosecha", "fechaIngreso", "id", "kgTotales", "notas", "productor", "temporada", "ubicacionPacking", "variedad" FROM "lotes";
DROP TABLE "lotes";
ALTER TABLE "new_lotes" RENAME TO "lotes";
CREATE UNIQUE INDEX "lotes_codigo_key" ON "lotes"("codigo");
CREATE INDEX "lotes_clienteId_idx" ON "lotes"("clienteId");
CREATE INDEX "lotes_especie_idx" ON "lotes"("especie");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
