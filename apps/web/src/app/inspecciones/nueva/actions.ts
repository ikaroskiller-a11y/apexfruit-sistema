"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EspecieFruta, ResultadoInspeccion } from "@prisma/client";
import { evaluarResultadoCereza, firmezaUnidadPorEspecie } from "@/lib/normas";
import { getCurrentUser } from "@/lib/auth";
import { inspeccionSchema, parsearDefectos, type FormState } from "@/lib/validation";

function datosDesdeFormulario(formData: FormData) {
  return {
    loteId: formData.get("loteId"),
    inspectorId: formData.get("inspectorId"),
    fecha: formData.get("fecha"),
    resultado: formData.get("resultado"),
    calibre: formData.get("calibre"),
    color: formData.get("color"),
    colorPorcentajeDark: formData.get("colorPorcentajeDark"),
    colorPorcentajeLight: formData.get("colorPorcentajeLight"),
    firmeza: formData.get("firmeza"),
    brixGrados: formData.get("brixGrados"),
    acidez: formData.get("acidez"),
    pesoMuestraKg: formData.get("pesoMuestraKg"),
    muestraCajas: formData.get("muestraCajas"),
    muestraUnidades: formData.get("muestraUnidades"),
    hidrocoolerTempAguaC: formData.get("hidrocoolerTempAguaC"),
    hidrocoolerCloroLibrePpm: formData.get("hidrocoolerCloroLibrePpm"),
    hidrocoolerTiempoExposicionMin: formData.get("hidrocoolerTiempoExposicionMin"),
    hidrocoolerTempPulpaPostC: formData.get("hidrocoolerTempPulpaPostC"),
    porcentajeRechazo: formData.get("porcentajeRechazo"),
    observaciones: formData.get("observaciones"),
  };
}

function booleanoOpcional(formData: FormData, campo: string): boolean | undefined {
  const valor = formData.get(campo);
  if (valor === "true") return true;
  if (valor === "false") return false;
  return undefined;
}

async function guardarFotos(inspeccionId: string, formData: FormData): Promise<void> {
  const fotos = formData.getAll("fotos").filter((f): f is File => f instanceof File && f.size > 0);
  if (fotos.length === 0) return;

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  for (const foto of fotos) {
    const ext = path.extname(foto.name) || ".jpg";
    const filename = `${randomUUID()}${ext}`;
    const bytes = Buffer.from(await foto.arrayBuffer());
    await writeFile(path.join(uploadsDir, filename), bytes);

    await prisma.foto.create({
      data: {
        inspeccionId,
        url: `/uploads/${filename}`,
        descripcion: foto.name,
      },
    });
  }
}

export async function crearInspeccion(_prevState: FormState, formData: FormData): Promise<FormState> {
  const usuarioActual = await getCurrentUser();
  if (!usuarioActual) {
    // Proxy ya debería haber redirigido antes de llegar acá; esto es
    // defensa en profundidad (ej: token expiró justo entre cargar el
    // formulario y enviarlo).
    redirect("/login?next=/inspecciones/nueva");
  }

  // Un INSPECTOR siempre queda como inspector de su propia inspección,
  // sin importar qué venga en el formulario (el campo va oculto/disabled
  // en la UI para ese rol, pero el control real de seguridad es este).
  // Solo un ADMINISTRADOR puede registrarla a nombre de otro inspector.
  const datos = datosDesdeFormulario(formData);
  if (usuarioActual.rol !== "ADMINISTRADOR") {
    datos.inspectorId = usuarioActual.id;
  }

  const parsed = inspeccionSchema.safeParse(datos);
  if (!parsed.success) {
    return {
      error: "Revisa los campos marcados: hay datos inválidos o incompletos.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const defectosResultado = parsearDefectos(formData);
  if ("error" in defectosResultado) return defectosResultado.error;
  const { defectos } = defectosResultado;

  const lote = await prisma.lote.findUnique({
    where: { id: parsed.data.loteId },
    select: { especie: true },
  });
  if (!lote) {
    return {
      error: "El lote seleccionado no existe.",
      fieldErrors: { loteId: ["Selecciona un lote válido."] },
    };
  }

  const inspector = await prisma.usuario.findUnique({
    where: { id: parsed.data.inspectorId },
    select: { id: true, activo: true },
  });
  if (!inspector || !inspector.activo) {
    return {
      error: "El inspector seleccionado no existe o está inactivo.",
      fieldErrors: { inspectorId: ["Selecciona un inspector válido."] },
    };
  }

  // Para cereza, el resultado final se recalcula con la tolerancia real de
  // 3 niveles (ver src/lib/normas.ts) en vez de confiar en el select manual.
  const resultado =
    lote.especie === EspecieFruta.CEREZA
      ? (evaluarResultadoCereza(defectos.map((d) => ({ tipo: d.tipo, porcentaje: d.porcentaje }))) as ResultadoInspeccion)
      : (parsed.data.resultado ?? ResultadoInspeccion.CATEGORIA_1);

  let inspeccion;
  try {
    inspeccion = await prisma.inspeccion.create({
      data: {
        loteId: parsed.data.loteId,
        inspectorId: parsed.data.inspectorId,
        fecha: parsed.data.fecha ? new Date(parsed.data.fecha) : new Date(),
        calibre: parsed.data.calibre,
        color: parsed.data.color,
        colorPorcentajeDark: parsed.data.colorPorcentajeDark,
        colorPorcentajeLight: parsed.data.colorPorcentajeLight,
        firmeza: parsed.data.firmeza,
        firmezaUnidad: firmezaUnidadPorEspecie(lote.especie),
        brixGrados: parsed.data.brixGrados,
        acidez: parsed.data.acidez,
        pesoMuestraKg: parsed.data.pesoMuestraKg,
        muestraCajas: parsed.data.muestraCajas,
        muestraUnidades: parsed.data.muestraUnidades,
        hidrocoolerTempAguaC: parsed.data.hidrocoolerTempAguaC,
        hidrocoolerCloroLibrePpm: parsed.data.hidrocoolerCloroLibrePpm,
        hidrocoolerTiempoExposicionMin: parsed.data.hidrocoolerTiempoExposicionMin,
        hidrocoolerTempPulpaPostC: parsed.data.hidrocoolerTempPulpaPostC,
        hidrocoolerEsperaMasDeUnaHora: booleanoOpcional(formData, "hidrocoolerEsperaMasDeUnaHora"),
        porcentajeRechazo: parsed.data.porcentajeRechazo,
        resultado,
        observaciones: parsed.data.observaciones,
      },
    });
  } catch {
    return { error: "No se pudo guardar la inspección. Intenta nuevamente." };
  }

  if (defectos.length > 0) {
    await prisma.defecto.createMany({
      data: defectos.map((d) => ({
        inspeccionId: inspeccion.id,
        tipo: d.tipo,
        porcentaje: d.porcentaje,
        cantidad: d.cantidad,
        esCritico: d.tipo === "PUDRICION_HUMEDA",
      })),
    });
  }

  // Fotos: se guardan en /public/uploads (almacenamiento local, solo para
  // desarrollo — en producción esto debería ir a un bucket externo).
  await guardarFotos(inspeccion.id, formData);

  redirect(`/inspecciones/${inspeccion.id}`);
}
