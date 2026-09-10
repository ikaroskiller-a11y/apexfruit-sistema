"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORES: Record<"A" | "B" | "C", string> = {
  A: "var(--color-state-success)",
  B: "var(--color-state-warning)",
  C: "var(--color-state-danger)",
};

export default function MuestraCalidadDonutChart({
  conteos,
}: {
  conteos: { A: number; B: number; C: number };
}) {
  const total = conteos.A + conteos.B + conteos.C;
  if (total === 0) {
    return <p className="text-sm text-fg-muted">Todavía no hay datos suficientes.</p>;
  }

  const data = (["A", "B", "C"] as const)
    .map((k) => ({ name: `Calidad ${k}`, key: k, value: conteos[k] }))
    .filter((d) => d.value > 0);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
        >
          {data.map((d) => (
            <Cell key={d.key} fill={COLORES[d.key]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [
            `${value} muestra${value === 1 ? "" : "s"} (${((Number(value) / total) * 100).toFixed(0)}%)`,
            name,
          ]}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid var(--color-border)",
            background: "var(--color-card)",
            color: "var(--color-fg)",
            fontSize: 12,
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={28}
          formatter={(value) => <span style={{ color: "var(--color-fg-muted)", fontSize: 12 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
