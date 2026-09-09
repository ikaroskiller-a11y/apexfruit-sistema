-- CreateEnum
CREATE TYPE "EtapaInspeccion" AS ENUM ('RECEPCION', 'POST_HIDROENFRIADO', 'PRE_DESPACHO');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TipoDefecto" ADD VALUE 'CORTE_HERIDA';
ALTER TYPE "TipoDefecto" ADD VALUE 'ROCE_RAMA';
ALTER TYPE "TipoDefecto" ADD VALUE 'PICADURA_INSECTO_SANA';
ALTER TYPE "TipoDefecto" ADD VALUE 'PERFORACION_GUSANO';
ALTER TYPE "TipoDefecto" ADD VALUE 'DANO_ACARO';
ALTER TYPE "TipoDefecto" ADD VALUE 'DANO_ESCAMA';
ALTER TYPE "TipoDefecto" ADD VALUE 'PUDRICION_AZUL';
ALTER TYPE "TipoDefecto" ADD VALUE 'PUDRICION_GRIS';
ALTER TYPE "TipoDefecto" ADD VALUE 'PUDRICION_AMARGA';
ALTER TYPE "TipoDefecto" ADD VALUE 'PUDRICION_MUCOR';
ALTER TYPE "TipoDefecto" ADD VALUE 'PUDRICION_PEDUNCULAR';
ALTER TYPE "TipoDefecto" ADD VALUE 'BITTER_PIT';
ALTER TYPE "TipoDefecto" ADD VALUE 'ESCALDADO_SUPERFICIAL';
ALTER TYPE "TipoDefecto" ADD VALUE 'ESCALDADO_SENESCENTE';
ALTER TYPE "TipoDefecto" ADD VALUE 'CORAZON_ACUOSO';
ALTER TYPE "TipoDefecto" ADD VALUE 'MANCHA_CORCHOSA_ANJOU';
ALTER TYPE "TipoDefecto" ADD VALUE 'DEGENERACION_PULPA';
ALTER TYPE "TipoDefecto" ADD VALUE 'DANO_FRIO';
ALTER TYPE "TipoDefecto" ADD VALUE 'DEFECTO_COLOR';
ALTER TYPE "TipoDefecto" ADD VALUE 'FRUTA_APLANADA';
ALTER TYPE "TipoDefecto" ADD VALUE 'MARCHITAMIENTO';

-- AlterTable
ALTER TABLE "inspecciones" ADD COLUMN     "etapa" "EtapaInspeccion" NOT NULL DEFAULT 'RECEPCION';
