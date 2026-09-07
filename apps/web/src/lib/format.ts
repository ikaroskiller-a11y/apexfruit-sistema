export function formatFecha(fecha: Date | string): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatFechaHora(fecha: Date | string): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatPorcentaje(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return "—";
  return `${valor.toFixed(1)}%`;
}

export function formatNumero(valor: number | null | undefined, decimales = 1): string {
  if (valor === null || valor === undefined) return "—";
  return valor.toLocaleString("es-CL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimales,
  });
}
