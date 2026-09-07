"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Fila = {
  periodo: string;
  temporada: string;
  rechazoPromedio: number;
};

export default function EvolucionCalidadChart({ data }: { data: Fila[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-fg-muted">Todavía no hay inspecciones registradas.</p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 4, right: 16, left: -12, bottom: 4 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--chart-grid)"
          vertical={false}
        />
        <XAxis dataKey="periodo" tick={{ fontSize: 11, fill: "var(--chart-axis)" }} />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--chart-axis)" }}
          unit="%"
          width={40}
        />
        <Tooltip
          formatter={(value) => [`${Number(value).toFixed(1)}%`, "Rechazo prom."]}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid var(--color-border)",
            background: "var(--color-card)",
            color: "var(--color-fg)",
            fontSize: 12,
          }}
        />
        {/* Rechazo = severidad, no identidad de variedad: usa el hue de
            estado (rechazo), nunca un color categórico (guía §1.3). */}
        <Line
          type="monotone"
          dataKey="rechazoPromedio"
          stroke="var(--color-state-danger)"
          strokeWidth={2.5}
          dot={{ r: 3, fill: "var(--color-state-danger)" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
