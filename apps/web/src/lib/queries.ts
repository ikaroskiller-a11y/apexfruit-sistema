import { prisma } from "@/lib/prisma";
import { especieLabels } from "@/lib/labels";
import type { EspecieFruta } from "@prisma/client";

/**
 * Consultas de agregación para el dashboard.
 *
 * El volumen de datos de una PYME de inspección (cientos/miles de
 * inspecciones por temporada) es chico, así que se resuelve trayendo las
 * inspecciones relevantes y agregando en memoria. Si esto crece mucho,
 * conviene migrar a `groupBy` de Prisma o vistas materializadas en la BD.
 */

export async function getKpisGenerales() {
  const [totalLotes, totalInspecciones, totalClientes, inspecciones] =
    await Promise.all([
      prisma.lote.count(),
      prisma.inspeccion.count(),
      prisma.cliente.count(),
      prisma.inspeccion.findMany({ select: { porcentajeRechazo: true } }),
    ]);

  const valores = inspecciones
    .map((i) => i.porcentajeRechazo)
    .filter((v): v is number => v !== null && v !== undefined);

  const rechazoPromedio =
    valores.length > 0
      ? valores.reduce((a, b) => a + b, 0) / valores.length
      : 0;

  return { totalLotes, totalInspecciones, totalClientes, rechazoPromedio };
}

export async function getRechazoPorLote(limit = 10) {
  const lotes = await prisma.lote.findMany({
    include: {
      inspecciones: { select: { porcentajeRechazo: true } },
    },
  });

  const filas = lotes
    .map((lote) => {
      const valores = lote.inspecciones
        .map((i) => i.porcentajeRechazo)
        .filter((v): v is number => v !== null && v !== undefined);
      const promedio =
        valores.length > 0
          ? valores.reduce((a, b) => a + b, 0) / valores.length
          : null;
      return {
        loteId: lote.id,
        codigo: lote.codigo,
        variedad: lote.variedad,
        especie: especieLabels[lote.especie],
        rechazoPromedio: promedio,
        nInspecciones: valores.length,
      };
    })
    .filter((f) => f.rechazoPromedio !== null)
    .sort((a, b) => (b.rechazoPromedio ?? 0) - (a.rechazoPromedio ?? 0));

  return filas.slice(0, limit) as {
    loteId: string;
    codigo: string;
    variedad: string;
    especie: string;
    rechazoPromedio: number;
    nInspecciones: number;
  }[];
}

export async function getEvolucionPorTemporada() {
  const inspecciones = await prisma.inspeccion.findMany({
    select: {
      fecha: true,
      porcentajeRechazo: true,
      lote: { select: { temporada: true } },
    },
    orderBy: { fecha: "asc" },
  });

  const grupos = new Map<
    string,
    { suma: number; n: number; temporada: string; fechaOrden: number }
  >();

  for (const insp of inspecciones) {
    if (insp.porcentajeRechazo === null || insp.porcentajeRechazo === undefined)
      continue;
    const fecha = new Date(insp.fecha);
    const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
    const label = fecha.toLocaleDateString("es-CL", {
      month: "short",
      year: "2-digit",
    });
    const key = `${insp.lote.temporada}__${mesKey}`;
    const actual = grupos.get(key) ?? {
      suma: 0,
      n: 0,
      temporada: insp.lote.temporada,
      fechaOrden: fecha.getTime(),
    };
    actual.suma += insp.porcentajeRechazo;
    actual.n += 1;
    grupos.set(key, actual);

    // Guardamos el label legible aparte para no repetir cálculo
    (actual as unknown as { label: string }).label = label;
  }

  return Array.from(grupos.entries())
    .sort((a, b) => a[1].fechaOrden - b[1].fechaOrden)
    .map(([, v]) => ({
      periodo: (v as unknown as { label: string }).label,
      temporada: v.temporada,
      rechazoPromedio: Number((v.suma / v.n).toFixed(1)),
    }));
}

export async function getComparativaPorEspecie() {
  const lotes = await prisma.lote.findMany({
    select: {
      especie: true,
      inspecciones: { select: { porcentajeRechazo: true } },
    },
  });

  const acumulado = new Map<EspecieFruta, { suma: number; n: number }>();
  for (const lote of lotes) {
    for (const insp of lote.inspecciones) {
      if (insp.porcentajeRechazo === null || insp.porcentajeRechazo === undefined)
        continue;
      const actual = acumulado.get(lote.especie) ?? { suma: 0, n: 0 };
      actual.suma += insp.porcentajeRechazo;
      actual.n += 1;
      acumulado.set(lote.especie, actual);
    }
  }

  return Array.from(acumulado.entries())
    .map(([especie, { suma, n }]) => ({
      especie: especieLabels[especie],
      rechazoPromedio: Number((suma / n).toFixed(1)),
      nInspecciones: n,
    }))
    .sort((a, b) => b.rechazoPromedio - a.rechazoPromedio);
}

export async function getComparativaPorCliente() {
  const clientes = await prisma.cliente.findMany({
    select: {
      nombre: true,
      lotes: {
        select: { inspecciones: { select: { porcentajeRechazo: true } } },
      },
    },
  });

  return clientes
    .map((cliente) => {
      const valores = cliente.lotes
        .flatMap((l) => l.inspecciones)
        .map((i) => i.porcentajeRechazo)
        .filter((v): v is number => v !== null && v !== undefined);
      const promedio =
        valores.length > 0
          ? valores.reduce((a, b) => a + b, 0) / valores.length
          : null;
      return {
        cliente: cliente.nombre,
        rechazoPromedio: promedio !== null ? Number(promedio.toFixed(1)) : null,
        nInspecciones: valores.length,
      };
    })
    .filter((c) => c.rechazoPromedio !== null)
    .sort((a, b) => (b.rechazoPromedio ?? 0) - (a.rechazoPromedio ?? 0));
}
