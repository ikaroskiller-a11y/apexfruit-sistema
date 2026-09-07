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
      <p className="text-sm text-ink/50">Todavía no hay inspecciones registradas.</p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#15211b1a" vertical={false} />
        <XAxis
          dataKey="codigo"
          tick={{ fontSize: 11, fill: "#15211b99" }}
          angle={-35}
          textAnchor="end"
          interval={0}
          height={50}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#15211b99" }}
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
            border: "1px solid #15211b1a",
            fontSize: 12,
          }}
        />
        <Bar dataKey="rechazoPromedio" fill="#1f6b49" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
