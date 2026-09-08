-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMINISTRADOR', 'INSPECTOR');

-- CreateEnum
CREATE TYPE "EspecieFruta" AS ENUM ('MANZANA', 'UVA_DE_MESA', 'CEREZA', 'ARANDANO', 'PERA', 'KIWI', 'CIRUELA', 'OTRO');

-- CreateEnum
CREATE TYPE "MercadoDestino" AS ENUM ('USA', 'EUROPA', 'JAPON', 'COREA', 'CHINA', 'INDIA', 'LATAM', 'OTRO');

-- CreateEnum
CREATE TYPE "ResultadoInspeccion" AS ENUM ('CATEGORIA_1', 'CATEGORIA_2', 'OBJETADO');

-- CreateEnum
CREATE TYPE "FirmezaUnidad" AS ENUM ('KGF', 'UD_DUROFEL', 'LBS');

-- CreateEnum
CREATE TYPE "TipoDefecto" AS ENUM ('RUSSET', 'FUERA_DE_COLOR', 'AUSENCIA_PEDICELO', 'DEFORME', 'MANCHA', 'SOBREMADURO', 'PARTIDURA_CRACKING', 'HERIDA_ABIERTA', 'PUDRICION_HUMEDA', 'PUDRICION_SECA', 'PITTING', 'MAGULLADURA', 'PEDICELO_SECO', 'MEDIALUNA', 'QUEMADURA_SOL', 'DANO_INSECTO', 'INMADURO', 'DANO_GRANIZO', 'DESGRANE', 'BLANDURA', 'OTRO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "rol" "RolUsuario" NOT NULL DEFAULT 'INSPECTOR',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "telefono" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
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

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lotes" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "especie" "EspecieFruta" NOT NULL,
    "variedad" TEXT NOT NULL,
    "productor" TEXT NOT NULL,
    "ubicacionPacking" TEXT NOT NULL,
    "temporada" TEXT NOT NULL,
    "fechaCosecha" TIMESTAMP(3),
    "fechaIngreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cajasTotales" INTEGER,
    "kgTotales" DOUBLE PRECISION,
    "calibrePredominante" TEXT,
    "mercadoDestino" "MercadoDestino",
    "notas" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "clienteId" TEXT NOT NULL,

    CONSTRAINT "lotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspecciones" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calibre" TEXT,
    "color" TEXT,
    "colorPorcentajeDark" INTEGER,
    "colorPorcentajeLight" INTEGER,
    "firmeza" DOUBLE PRECISION,
    "firmezaUnidad" "FirmezaUnidad",
    "brixGrados" DOUBLE PRECISION,
    "acidez" DOUBLE PRECISION,
    "pesoMuestraKg" DOUBLE PRECISION,
    "muestraCajas" INTEGER,
    "muestraUnidades" INTEGER,
    "hidrocoolerTempAguaC" DOUBLE PRECISION,
    "hidrocoolerCloroLibrePpm" DOUBLE PRECISION,
    "hidrocoolerTiempoExposicionMin" DOUBLE PRECISION,
    "hidrocoolerTempPulpaPostC" DOUBLE PRECISION,
    "hidrocoolerEsperaMasDeUnaHora" BOOLEAN,
    "porcentajeRechazo" DOUBLE PRECISION,
    "resultado" "ResultadoInspeccion" NOT NULL DEFAULT 'CATEGORIA_1',
    "observaciones" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "loteId" TEXT NOT NULL,
    "inspectorId" TEXT NOT NULL,

    CONSTRAINT "inspecciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "defectos" (
    "id" TEXT NOT NULL,
    "tipo" "TipoDefecto" NOT NULL,
    "cantidad" INTEGER,
    "porcentaje" DOUBLE PRECISION,
    "esCritico" BOOLEAN NOT NULL DEFAULT false,
    "notas" TEXT,
    "inspeccionId" TEXT NOT NULL,

    CONSTRAINT "defectos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fotos" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "descripcion" TEXT,
    "subidaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inspeccionId" TEXT NOT NULL,

    CONSTRAINT "fotos_pkey" PRIMARY KEY ("id")
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

-- AddForeignKey
ALTER TABLE "lotes" ADD CONSTRAINT "lotes_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspecciones" ADD CONSTRAINT "inspecciones_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "lotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspecciones" ADD CONSTRAINT "inspecciones_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "defectos" ADD CONSTRAINT "defectos_inspeccionId_fkey" FOREIGN KEY ("inspeccionId") REFERENCES "inspecciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fotos" ADD CONSTRAINT "fotos_inspeccionId_fkey" FOREIGN KEY ("inspeccionId") REFERENCES "inspecciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
