"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

/**
 * Aviso visual persistente de "Sin conexión" — el inspector en el packing
 * necesita saber, sin adivinar, que lo que está por guardar quedará como
 * borrador local (ver src/lib/borradores.ts) en vez de subirse al instante.
 */
export default function OnlineStatus() {
  // Lee el estado real recién en el efecto (evita mismatch de hidratación:
  // el server siempre renderiza "en línea"), pero como inicializador de
  // useState en vez de un setState suelto dentro del cuerpo del efecto.
  const [enLinea, setEnLinea] = useState(() =>
    typeof navigator === "undefined" || typeof navigator.onLine !== "boolean"
      ? true
      : navigator.onLine
  );

  useEffect(() => {
    const marcarEnLinea = () => setEnLinea(true);
    const marcarSinConexion = () => setEnLinea(false);
    window.addEventListener("online", marcarEnLinea);
    window.addEventListener("offline", marcarSinConexion);
    return () => {
      window.removeEventListener("online", marcarEnLinea);
      window.removeEventListener("offline", marcarSinConexion);
    };
  }, []);

  if (enLinea) return null;

  return (
    <span className="flex items-center gap-1.5 rounded-full border border-state-warning bg-state-warning-bg px-3 py-1 text-xs font-medium text-state-warning">
      <WifiOff className="h-3.5 w-3.5" aria-hidden />
      Sin conexión
    </span>
  );
}
