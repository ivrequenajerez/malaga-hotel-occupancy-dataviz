"use client";
import { useMemo, useState } from "react";
import type { RegistroOcupacion } from "../lib/types";
import HeatmapMesAnio from "./HeatmapMesAnio";

type Props = { data: RegistroOcupacion[] };

export default function HeatmapWithControls({ data }: Props) {
  const years = useMemo(() => {
    const ys = Array.from(
      new Set(data.map((d) => Number(d.mes.slice(0, 4))))
    ).sort((a, b) => b - a);
    return ys;
  }, [data]);

  const defaultFrom = years.length
    ? years[Math.min(4, years.length - 1)]
    : undefined;
  const [fromYear, setFromYear] = useState<number | undefined>(defaultFrom);
  const [toYear, setToYear] = useState<number | undefined>(years[0]);

  // sanea combinaciones (from <= to)
  const from = fromYear && toYear && fromYear > toYear ? toYear : fromYear;

  return (
    <section aria-labelledby="filtro-anios">
      <div className="flex flex-wrap gap-3 items-end mb-4">
        <div>
          <label htmlFor="from" id="filtro-anios" className="block text-sm">
            desde
          </label>
          <select
            id="from"
            className="border rounded px-2 py-1 text-sm"
            value={from ?? ""}
            onChange={(e) =>
              setFromYear(e.target.value ? Number(e.target.value) : undefined)
            }
          >
            {years
              .slice()
              .reverse()
              .map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label htmlFor="to" className="block text-sm">
            hasta
          </label>
          <select
            id="to"
            className="border rounded px-2 py-1 text-sm"
            value={toYear ?? ""}
            onChange={(e) =>
              setToYear(e.target.value ? Number(e.target.value) : undefined)
            }
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="ml-auto underline text-sm"
          onClick={() => {
            setFromYear(defaultFrom);
            setToYear(years[0]);
          }}
          aria-label="restablecer filtro de años"
        >
          reset
        </button>
      </div>

      <HeatmapMesAnio data={data} fromYear={from} toYear={toYear} />
    </section>
  );
}
