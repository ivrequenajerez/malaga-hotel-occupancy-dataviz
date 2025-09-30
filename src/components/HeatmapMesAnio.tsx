"use client";
import { useMemo } from "react";
import type { RegistroOcupacion } from "../lib/types";

const PALETTE = [
  "#440154",
  "#472a7a",
  "#3b528b",
  "#2c728e",
  "#21918c",
  "#27ad81",
  "#5ec962",
  "#aadc32",
  "#fde725",
];

const mesesCorto = [
  "ene",
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

type Props = {
  data: RegistroOcupacion[]; // { mes:'yyyy-mm', distrito:'malaga', ocupacion_pct:0-100 }
  fromYear?: number;
  toYear?: number;
};

export default function HeatmapMesAnio({ data, fromYear, toYear }: Props) {
  const { years, valueOf, minY, maxY } = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((d) => map.set(d.mes, Number(d.ocupacion_pct)));

    // años presentes
    const yearsSet = new Set<number>();
    for (const d of data) yearsSet.add(Number(d.mes.slice(0, 4)));
    let years = Array.from(yearsSet).sort((a, b) => b - a);

    const minY = fromYear ?? Math.min(...years);
    const maxY = toYear ?? Math.max(...years);
    years = years.filter((y) => y >= minY && y <= maxY);

    const valueOf = (y: number, m: number) => {
      const key = `${y}-${String(m).padStart(2, "0")}`;
      return map.has(key) ? (map.get(key) as number) : null;
    };

    return { years, valueOf, minY, maxY };
  }, [data, fromYear, toYear]);

  const colorFor = (v: number | null) => {
    if (v == null)
      return "repeating-linear-gradient(45deg, #e5e7eb 0 6px, #ffffff 6px 12px)"; // sin dato
    const idx = Math.max(
      0,
      Math.min(PALETTE.length - 1, Math.floor((v / 100) * (PALETTE.length - 1)))
    );
    return PALETTE[idx];
  };
  const onGridKeyDown: React.KeyboardEventHandler<HTMLTableElement> = (e) => {
    const key = e.key;
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key))
      return;

    const target = e.target as HTMLElement | null;
    if (!target) return;

    // buscamos el botón “celda”
    const btn = target.closest(
      "button[data-r][data-c]"
    ) as HTMLButtonElement | null;
    if (!btn) return;

    e.preventDefault();

    const r = Number(btn.dataset.r); // fila
    const c = Number(btn.dataset.c); // columna

    let nr = r,
      nc = c;
    if (key === "ArrowUp") nr = r - 1;
    if (key === "ArrowDown") nr = r + 1;
    if (key === "ArrowLeft") nc = c - 1;
    if (key === "ArrowRight") nc = c + 1;

    const next = btn
      .closest("table")
      ?.querySelector<HTMLButtonElement>(
        `button[data-r="${nr}"][data-c="${nc}"]`
      );

    if (next) next.focus();
  };

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-lg font-medium">heatmap año × mes (ocupación %)</h3>
        <p className="text-sm text-neutral-600">
          rango: {minY}–{maxY}
        </p>
      </div>

      <div
        className="overflow-x-auto"
        style={{ contentVisibility: "auto", containIntrinsicSize: "600px" }}
      >
        <table
          className="border-collapse"
          aria-label="mapa de calor de ocupación por año y mes"
          data-testid="heatmap-table"
          onKeyDown={onGridKeyDown}
        >
          <caption id="cap-heatmap">
            ocupación mensual (municipio de málaga)
          </caption>
          <thead>
            <tr>
              <th
                className="text-left text-xs font-normal pr-2 py-1 sticky left-0 bg-white"
                scope="col"
              >
                año
              </th>
              {mesesCorto.map((m) => (
                <th
                  key={m}
                  className="text-xs font-normal px-1 py-1"
                  scope="col"
                >
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {years.map((y, rowIndex) => (
              <tr key={y}>
                <th
                  scope="row"
                  className="text-right text-xs pr-2 py-1 sticky left-0 bg-white"
                >
                  {y}
                </th>
                
                {mesesCorto.map((_, i) => {

                  const v = valueOf(y, i + 1);
                  const mm = String(i + 1).padStart(2, "0");
                  const label =
                    v == null
                      ? `${y}-${mm}: sin dato`
                      : `${y}-${mm}: ${v}% ocupación`;

                  return (
                    <td key={i} className="p-0">
                      <button
                        aria-label={label}
                        tabIndex={0}
                        data-r={rowIndex}
                        data-c={i}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 border border-transparent focus:border-black/40"
                        style={{ background: colorFor(v) }}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p id="legend" className="sr-only">
          más oscuro = mayor ocupación
        </p>
      </div>

      {/* leyenda */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-neutral-700">0%</span>
        <div
          className="h-3 w-40 sm:w-56 rounded"
          style={{
            background: `linear-gradient(to right, ${PALETTE.join(",")})`,
          }}
        />
        <span className="text-xs text-neutral-700">100%</span>
        <span className="ml-3 text-xs text-neutral-500">sin dato</span>
        <div
          className="h-3 w-6 border"
          style={{
            background:
              "repeating-linear-gradient(45deg, #e5e7eb 0 6px, #ffffff 6px 12px)",
          }}
        />
      </div>

      <p className="text-xs text-neutral-500 mt-2">
        consejo: usa tabulador para recorrer celdas; cada celda anuncia año/mes
        y % en lectores de pantalla.
      </p>
    </div>
  );
}
