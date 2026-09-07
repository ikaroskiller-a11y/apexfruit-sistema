"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EspecieFruta, FirmezaUnidad, ResultadoInspeccion, TipoDefecto } from "@prisma/client";
import { evaluarResultadoCereza } from "@/lib/normas";

function numeroOpcional(formData: FormData, campo: string): number | undefined {
  const valor = formData.get(campo);
  if (typeof valor !== "string" || valor.trim() === "") return undefined;
  const n = Number(valor);
  return Number.isNaN(n) ? undefined : n;
}

function textoOpcional(formData: FormData, campo: string): string | undefined {
  const valor = formData.get(campo);
  if (typeof valor !== "string" || valor.trim() === "") return undefined;
  return valor.trim();
}

function booleanoOpcional(formData: FormData, campo: string): boolean | undefined {
  const valor = formData.get(campo);
  if (valor === "true") return true;
  if (valor === "false") return false;
  return undefined;
}

// Unidad de firmeza real por especie (manzana/pera -> kgF, cereza -> UD
// Durofel, kiwi -> libras). Se deriva server-side de la especie del lote
// para no depender de que el cliente la mande "bien".
function firmezaUnidadPorEspecie(especie: EspecieFruta): FirmezaUnidad | undefined {
  switch (especie) {
    case EspecieFruta.MANZANA:
    case EspecieFruta.PERA:
      return FirmezaUnidad.KGF;
    case EspecieFruta.CEREZA:
      return FirmezaUnidad.UD_DUROFEL;
    case EspecieFruta.KIWI:
      return FirmezaUnidad.LBS;
    default:
      return undefined;
  }
}

const MAX_DEFECTOS = 10;

export async function crearInspeccion(formData: FormData) {
  const loteId = formData.get("loteId");
  const inspectorId = formData.get("inspectorId");

  if (typeof loteId !== "string" || !loteId) {
    throw new Error("Debe seleccionar un lote.");
  }
  if (typeof inspectorId !== "string" || !inspectorId) {
    throw new Error("Debe seleccionar un inspector.");
  }

  const lote = await prisma.lote.findUnique({
    where: { id: loteId },
    select: { especie: true },
  });
  if (!lote) {
    throw new Error("Lote no encontrado.");
  }

  const fechaStr = textoOpcional(formData, "fecha");
  const resultadoFormulario =
    (formData.get("resultado") as ResultadoInspeccion | null) ??
    ResultadoInspeccion.CATEGORIA_1;

  // Defectos: se envían como filas indexadas defectoTipo_0, defectoPorcentaje_0, ...
  const defectosData: { tipo: TipoDefecto; porcentaje?: number; cantidad?: number }[] = [];
  for (let i = 0; i < MAX_DEFECTOS; i++) {
    const tipo = formData.get(`defectoTipo_${i}`);
    if (typeof tipo !== "string" || !tipo) continue;
    const porcentaje = numeroOpcional(formData, `defectoPorcentaje_${i}`);
    const cantidad = numeroOpcional(formData, `defectoCantidad_${i}`);
    if (porcentaje === undefined && cantidad === undefined) continue;
    defectosData.push({ tipo: tipo as TipoDefecto, porcentaje, cantidad });
  }

  // Para cereza, el resultado final se recalcula con la tolerancia real de
  // 3 niveles (ver src/lib/normas.ts) en vez de confiar en el select manual.
  const resultado =
    lote.especie === EspecieFruta.CEREZA
      ? (evaluarResultadoCereza(
          defectosData.map((d) => ({ tipo: d.tipo, porcentaje: d.porcentaje }))
        ) as ResultadoInspeccion)
      : resultadoFormulario;

  const inspeccion = await prisma.inspeccion.create({
    data: {
      loteId,
      inspectorId,
      fecha: fechaStr ? new Date(fechaStr) : new Date(),
      calibre: textoOpcional(formData, "calibre"),
      color: textoOpcional(formData, "color"),
      colorPorcentajeDark: numeroOpcional(formData, "colorPorcentajeDark"),
      colorPorcentajeLight: numeroOpcional(formData, "colorPorcentajeLight"),
      firmeza: numeroOpcional(formData, "firmeza"),
      firmezaUnidad: firmezaUnidadPorEspecie(lote.especie),
      brixGrados: numeroOpcional(formData, "brixGrados"),
      acidez: numeroOpcional(formData, "acidez"),
      pesoMuestraKg: numeroOpcional(formData, "pesoMuestraKg"),
      muestraCajas: numeroOpcional(formData, "muestraCajas"),
      muestraUnidades: numeroOpcional(formData, "muestraUnidades"),
      hidrocoolerTempAguaC: numeroOpcional(formData, "hidrocoolerTempAguaC"),
      hidrocoolerCloroLibrePpm: numeroOpcional(formData, "hidrocoolerCloroLibrePpm"),
      hidrocoolerTiempoExposicionMin: numeroOpcional(formData, "hidrocoolerTiempoExposicionMin"),
      hidrocoolerTempPulpaPostC: numeroOpcional(formData, "hidrocoolerTempPulpaPostC"),
      hidrocoolerEsperaMasDeUnaHora: booleanoOpcional(formData, "hidrocoolerEsperaMasDeUnaHora"),
      porcentajeRechazo: numeroOpcional(formData, "porcentajeRechazo"),
      resultado,
      observaciones: textoOpcional(formData, "observaciones"),
    },
  });

  if (defectosData.length > 0) {
    await prisma.defecto.createMany({
      data: defectosData.map((d) => ({
        inspeccionId: inspeccion.id,
        tipo: d.tipo,
        porcentaje: d.porcentaje,
        cantidad: d.cantidad,
        esCritico: d.tipo === TipoDefecto.PUDRICION_HUMEDA,
      })),
    });
  }

  // Fotos: se guardan en /public/uploads (almacenamiento local, solo para
  // desarrollo — en producción esto debería ir a un bucket externo).
  const fotos = formData.getAll("fotos").filter((f): f is File => f instanceof File && f.size > 0);
  if (fotos.length > 0) {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    for (const foto of fotos) {
      const ext = path.extname(foto.name) || ".jpg";
      const filename = `${randomUUID()}${ext}`;
      const bytes = Buffer.from(await foto.arrayBuffer());
      await writeFile(path.join(uploadsDir, filename), bytes);

      await prisma.foto.create({
        data: {
          inspeccionId: inspeccion.id,
          url: `/uploads/${filename}`,
          descripcion: foto.name,
        },
      });
    }
  }

  redirect(`/inspecciones/${inspeccion.id}`);
}
