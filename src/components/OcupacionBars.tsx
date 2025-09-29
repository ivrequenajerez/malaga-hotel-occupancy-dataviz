/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import type { RegistroOcupacion } from "../lib/types";

type Props = { data: RegistroOcupacion[] };

const mesesCorto = [
  "enero",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

export default function OcupacionBars({ data }: Props) {
  const [activos, setActivos] = useState<string[] | null>(null);

  const { distritos, rows } = useMemo(() => {
    const meses = Array.from(new Set(data.map((d) => d.mes))).sort();
    const dists = Array.from(new Set(data.map((d) => d.distrito))).sort();

    const rows = meses.map((m) => {
      const idx = Number(m.slice(5, 7)) - 1;
      const row: Record<string, string | number> = { mes: mesesCorto[idx] };

      dists.forEach((dist) => {
        const item = data.find((d) => d.mes === m && d.distrito === dist);
        row[dist] = item ? Number(item.ocupacion_pct) : 0;
      });
      return row;
    });

    return { distritos: dists, rows };
  }, [data]);

  const visibles = activos ?? distritos;

  return (
    <div
      className="w-full h-[420px]"
      aria-label="gráfico de barras de ocupación por distrito"
    >
      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={() => setActivos(null)}
          className="text-sm underline"
          aria-label="mostrar todas las series"
        >
          mostrar todo
        </button>
      </div>
      <ResponsiveContainer>
        <BarChart
          data={rows}
          margin={{ top: 12, right: 24, left: 0, bottom: 12 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            label={{
              value: "ocupación (%)",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip
            formatter={(value: number, name: string) => [`${value}%`, name]}
          />
          <Legend
            onClick={(e: any) => {
              const name = e?.value as string;

              setActivos((prev) => {
                if (!prev) return distritos.filter((d) => d !== name);

                return prev.includes(name)
                  ? prev.filter((d) => d !== name)
                  : [...prev, name];
              });
            }}
            wrapperStyle={{ cursor: "pointer" }}
          />
          {distritos.map((dist) =>
            visibles.includes(dist) ? <Bar key={dist} dataKey={dist} /> : null
          )}
        </BarChart>
      </ResponsiveContainer>
      <p className="text-sm mt-2">
        fuente: datos abiertos málaga · ocupación hotelera
      </p>
    </div>
  );
}
