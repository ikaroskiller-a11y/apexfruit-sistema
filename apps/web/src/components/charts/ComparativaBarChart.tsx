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
  rechazoPromedio: number | null;
  [key: string]: unknown;
};

export default function ComparativaBarChart({
  data,
  categoryKey,
  color = "var(--color-state-danger)",
}: {
  data: Fila[];
  categoryKey: string;
  color?: string;
}) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-fg-muted">Todavía no hay datos suficientes.</p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--chart-grid)"
          horizontal={false}
        />
        <XAxis
          type="number"
          unit="%"
          tick={{ fontSize: 11, fill: "var(--chart-axis)" }}
        />
        <YAxis
          type="category"
          dataKey={categoryKey}
          tick={{ fontSize: 11, fill: "var(--chart-axis)" }}
          width={110}
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
        <Bar dataKey="rechazoPromedio" fill={color} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
