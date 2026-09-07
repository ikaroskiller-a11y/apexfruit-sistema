import type { ComponentType, ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

export type BadgeStatus = "success" | "warning" | "danger" | "info";

const statusStyles: Record<
  BadgeStatus,
  { classes: string; Icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }> }
> = {
  success: {
    classes: "bg-state-success-bg text-state-success",
    Icon: CheckCircle2,
  },
  warning: {
    classes: "bg-state-warning-bg text-state-warning",
    Icon: AlertTriangle,
  },
  danger: {
    classes: "bg-state-danger-bg text-state-danger",
    Icon: XCircle,
  },
  info: {
    classes: "bg-state-info-bg text-state-info",
    Icon: Info,
  },
};

/**
 * Badge de estado: ícono + texto + tinte de fondo, nunca solo color
 * (ver guía de diseño §4, "Badges de estado de inspección"). Pasa `status`
 * para el tratamiento semántico automático; `className` sigue disponible
 * como escape hatch para casos puntuales.
 */
export function Badge({
  children,
  status,
  className = "",
}: {
  children: ReactNode;
  status?: BadgeStatus;
  className?: string;
}) {
  const style = status ? statusStyles[status] : null;
  const Icon = style?.Icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        style ? style.classes : ""
      } ${className}`}
    >
      {Icon ? <Icon className="h-3 w-3 shrink-0" aria-hidden /> : null}
      {children}
    </span>
  );
}
