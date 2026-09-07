-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "rol" TEXT NOT NULL DEFAULT 'INSPECTOR',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "telefono" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "rut" TEXT,
    "contacto" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "notas" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "lotes" (
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
    "destino" TEXT,
    "notas" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    "clienteId" TEXT NOT NULL,
    CONSTRAINT "lotes_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inspecciones" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calibre" TEXT,
    "color" TEXT,
    "firmezaKgF" REAL,
    "brixGrados" REAL,
    "acidez" REAL,
    "pesoMuestraKg" REAL,
    "muestraCajas" INTEGER,
    "muestraUnidades" INTEGER,
    "porcentajeRechazo" REAL,
    "resultado" TEXT NOT NULL DEFAULT 'APROBADO',
    "observaciones" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    "loteId" TEXT NOT NULL,
    "inspectorId" TEXT NOT NULL,
    CONSTRAINT "inspecciones_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "lotes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "inspecciones_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "defectos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "cantidad" INTEGER,
    "porcentaje" REAL,
    "esCritico" BOOLEAN NOT NULL DEFAULT false,
    "notas" TEXT,
    "inspeccionId" TEXT NOT NULL,
    CONSTRAINT "defectos_inspeccionId_fkey" FOREIGN KEY ("inspeccionId") REFERENCES "inspecciones" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "fotos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "descripcion" TEXT,
    "subidaEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inspeccionId" TEXT NOT NULL,
    CONSTRAINT "fotos_inspeccionId_fkey" FOREIGN KEY ("inspeccionId") REFERENCES "inspecciones" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_rut_key" ON "clientes"("rut");

-- CreateIndex
CREATE UNIQUE INDEX "lotes_codigo_key" ON "lotes"("codigo");

-- CreateIndex
CREATE INDEX "lotes_clienteId_idx" ON "lotes"("clienteId");

-- CreateIndex
CREATE INDEX "lotes_especie_idx" ON "lotes"("especie");

-- CreateIndex
CREATE INDEX "inspecciones_loteId_idx" ON "inspecciones"("loteId");

-- CreateIndex
CREATE INDEX "inspecciones_inspectorId_idx" ON "inspecciones"("inspectorId");

-- CreateIndex
CREATE INDEX "inspecciones_fecha_idx" ON "inspecciones"("fecha");

-- CreateIndex
CREATE INDEX "defectos_inspeccionId_idx" ON "defectos"("inspeccionId");

-- CreateIndex
CREATE INDEX "fotos_inspeccionId_idx" ON "fotos"("inspeccionId");
