"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * Marca el informe/reporte de una inspección como enviado al cliente.
 * Cualquier usuario autenticado puede hacerlo (no solo admin) — es una
 * tarea administrativa de "ya se mandó el PDF", no una edición de datos
 * técnicos de la inspección.
 */
export async function marcarInformeEnviado(inspeccionId: string): Promise<void> {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login?next=/inspecciones");

  await prisma.inspeccion.update({
    where: { id: inspeccionId },
    data: { informeEnviado: true },
  });

  revalidatePath("/inspecciones");
}
