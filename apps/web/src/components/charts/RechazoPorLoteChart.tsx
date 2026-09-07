"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Fila = {
  codigo: string;
  variedad: string;
  rechazoPromedio: number;
};

export default function RechazoPorLoteChart({ data }: { data: Fila[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-fg-muted">Todavía no hay inspecciones registradas.</p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 24 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--chart-grid)"
          vertical={false}
        />
        <XAxis
          dataKey="codigo"
          tick={{ fontSize: 11, fill: "var(--chart-axis)", fontFamily: "var(--font-mono)" }}
          angle={-35}
          textAnchor="end"
          interval={0}
          height={50}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--chart-axis)" }}
          unit="%"
          width={40}
        />
        <Tooltip
          formatter={(value) => [`${Number(value).toFixed(1)}%`, "Rechazo prom."]}
          labelFormatter={(label, payload) =>
            payload?.[0]?.payload
              ? `${label} · ${payload[0].payload.variedad}`
              : label
          }
          contentStyle={{
            borderRadius: 8,
            border: "1px solid var(--color-border)",
            background: "var(--color-card)",
            color: "var(--color-fg)",
            fontSize: 12,
          }}
        />
        {/* % de rechazo = severidad, no identidad de variedad: usa el hue
            de estado (rechazo), nunca un color categórico (guía §1.3). */}
        <Bar dataKey="rechazoPromedio" fill="var(--color-state-danger)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
