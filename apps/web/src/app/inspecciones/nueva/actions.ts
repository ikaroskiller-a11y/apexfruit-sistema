"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ResultadoInspeccion, TipoDefecto } from "@prisma/client";

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

export async function crearInspeccion(formData: FormData) {
  const loteId = formData.get("loteId");
  const inspectorId = formData.get("inspectorId");

  if (typeof loteId !== "string" || !loteId) {
    throw new Error("Debe seleccionar un lote.");
  }
  if (typeof inspectorId !== "string" || !inspectorId) {
    throw new Error("Debe seleccionar un inspector.");
  }

  const fechaStr = textoOpcional(formData, "fecha");
  const resultado =
    (formData.get("resultado") as ResultadoInspeccion | null) ??
    ResultadoInspeccion.APROBADO;

  const inspeccion = await prisma.inspeccion.create({
    data: {
      loteId,
      inspectorId,
      fecha: fechaStr ? new Date(fechaStr) : new Date(),
      calibre: textoOpcional(formData, "calibre"),
      color: textoOpcional(formData, "color"),
      firmezaKgF: numeroOpcional(formData, "firmezaKgF"),
      brixGrados: numeroOpcional(formData, "brixGrados"),
      acidez: numeroOpcional(formData, "acidez"),
      pesoMuestraKg: numeroOpcional(formData, "pesoMuestraKg"),
      muestraCajas: numeroOpcional(formData, "muestraCajas"),
      muestraUnidades: numeroOpcional(formData, "muestraUnidades"),
      porcentajeRechazo: numeroOpcional(formData, "porcentajeRechazo"),
      resultado,
      observaciones: textoOpcional(formData, "observaciones"),
    },
  });

  // Defectos: se envían como filas indexadas defectoTipo_0, defectoPorcentaje_0, ...
  const MAX_DEFECTOS = 6;
  for (let i = 0; i < MAX_DEFECTOS; i++) {
    const tipo = formData.get(`defectoTipo_${i}`);
    if (typeof tipo !== "string" || !tipo) continue;
    const porcentaje = numeroOpcional(formData, `defectoPorcentaje_${i}`);
    const cantidad = numeroOpcional(formData, `defectoCantidad_${i}`);
    if (porcentaje === undefined && cantidad === undefined) continue;

    await prisma.defecto.create({
      data: {
        inspeccionId: inspeccion.id,
        tipo: tipo as TipoDefecto,
        porcentaje,
        cantidad,
        esCritico: tipo === TipoDefecto.PUDRICION,
      },
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
