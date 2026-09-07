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
      <p className="text-sm text-ink/50">Todavía no hay inspecciones registradas.</p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 4, right: 16, left: -12, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#15211b1a" vertical={false} />
        <XAxis dataKey="periodo" tick={{ fontSize: 11, fill: "#15211b99" }} />
        <YAxis tick={{ fontSize: 11, fill: "#15211b99" }} unit="%" width={40} />
        <Tooltip
          formatter={(value) => [`${Number(value).toFixed(1)}%`, "Rechazo prom."]}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #15211b1a",
            fontSize: 12,
          }}
        />
        <Line
          type="monotone"
          dataKey="rechazoPromedio"
          stroke="#e7a93d"
          strokeWidth={2.5}
          dot={{ r: 3, fill: "#e7a93d" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
