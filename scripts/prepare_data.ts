import fs from "node:fs";
import Papa from "papaparse";
import { z } from "zod";

/**
 * objetivo:
 * - leer data/raw/ocupacion.csv
 * - detectar columnas clave aunque cambien los nombres
 * - normalizar a: [{ mes:"yyyy-mm", distrito:"...", ocupacion_pct:number }]
 * - escribir data/clean/ocupacion.json
 */

const INPUT = "data/raw/ocupacion.csv";
const OUTPUT = "data/clean/ocupacion.json";

// helpers ------------- //
const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();

const toNumber = (v: unknown) => {
  if (v == null) return NaN;
  const s = String(v).replace(",", ".").replace("%", "").trim();
  return Number(s);
};

function yyyyMmFromAny(input: string): string | null {
  const val = String(input).trim();

  // yyyy-mm
  let m = val.match(/^(\d{4})-(\d{2})$/);
  if (m) return `${m[1]}-${m[2]}`;

  // yyyy-mm-dd
  m = val.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[1]}-${m[2]}`;

  // mm/yyyy
  m = val.match(/^(\d{2})\/(\d{4})$/);
  if (m) return `${m[2]}-${m[1]}`;

  // yyyy-m  (mes 1 dígito)
  m = val.match(/^(\d{4})-(\d{1})$/);
  if (m) return `${m[1]}-0${m[2]}`;

  // m/yyyy  (mes 1 dígito)
  m = val.match(/^(\d{1})\/(\d{4})$/);
  if (m) return `${m[2]}-0${m[1]}`;

  return null;
}

function composeYyyyMm(
  year: string | number,
  month: string | number
): string | null {
  const y = String(year).trim();
  const m = String(month).padStart(2, "0");
  return /^\d{4}$/.test(y) && /^\d{2}$/.test(m) ? `${y}-${m}` : null;
}

// detección de columnas -------- //
type HeaderMap = {
  colFecha?: string;
  colYear?: string;
  colMonth?: string;
  colDistrito?: string;
  colOcup?: string;
};

function detectColumns(headers: string[]): HeaderMap {
  const h = headers.map((x) => ({ raw: x, norm: slug(x) }));

  const find = (pred: (n: string) => boolean) =>
    h.find(({ norm }) => pred(norm))?.raw;

  const colFecha = find((n) =>
    /(periodo|fecha|mes\s*\/\s*a\u00f1o|mes-a\u00f1o|mes-anio|mes_ano|period|date)/.test(
      n
    )
  );

  const colYear = find((n) => /(^|\W)(a\u00f1o|anio|year)(\W|$)/.test(n));
  const colMonth = find((n) => /(^|\W)(mes|month)(\W|$)/.test(n));

  const colDistrito = find((n) =>
    /(distrit|zona|dpto|barrio|comarca|area|districto)/.test(n)
  );

  const colOcup = find((n) =>
    /(ocup|ocupa|grado.*ocup|%.*ocup|ocupaci[o\u00f3]n|plazas.*ocup)/.test(n)
  );

  return { colFecha, colYear, colMonth, colDistrito, colOcup };
}

// validación final -------------- //
const outSchema = z.object({
  mes: z.string().regex(/^\d{4}-\d{2}$/),
  distrito: z.string().min(1),
  ocupacion_pct: z.number().min(0).max(100),
});

// run --------------------------- //
function main() {
  if (!fs.existsSync(INPUT)) {
    console.error(`no existe ${INPUT}. baja el csv y guárdalo ahí.`);
    process.exit(1);
  }

  const csv = fs.readFileSync(INPUT, "utf-8");
  const parsed = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
    // muchos portales españoles usan ';' y comas decimales; dejamos que papaparse detecte,
    // y nosotros convertimos las comas decimales a punto en toNumber()
    delimiter: undefined,
  });

  if (parsed.errors?.length) {
    console.warn("[papaparse] primeros errores:", parsed.errors.slice(0, 3));
  }

  const rows = parsed.data as Record<string, unknown>[];
  if (!rows.length) {
    console.error("csv sin filas.");
    process.exit(1);
  }

  const headers = Object.keys(rows[0] ?? {});
  const { colFecha, colYear, colMonth, colDistrito, colOcup } =
    detectColumns(headers);

  if (!colOcup || (!colFecha && !(colYear && colMonth))) {
    console.error("no detecté columnas. encontrados:", {
      colFecha,
      colYear,
      colMonth,
      colDistrito,
      colOcup,
      headers,
    });
    process.exit(1);
  }

  if (!colDistrito) {
    console.warn(
      'aviso: no hay columna de distrito en este csv; usaré "ocupación" (nivel municipal).'
    );
  }
  console.log("fila cruda (ejemplo):", rows[0]);
  console.log(
    "fecha cruda:",
    rows[0]?.[colFecha!],
    "→",
    yyyyMmFromAny(String(rows[0]?.[colFecha!]))
  );
  console.log(
    "ocup crudo:",
    rows[0]?.[colOcup!],
    "→",
    toNumber(rows[0]?.[colOcup!])
  );

  const out = rows

    .map((r) => {
      const distrito = colDistrito
        ? slug(String(r[colDistrito] ?? ""))
        : "ocupación";

      const ocup = toNumber(r[colOcup!]);

      const mes = colFecha
        ? yyyyMmFromAny(String(r[colFecha] ?? ""))
        : composeYyyyMm(String(r[colYear!] ?? ""), String(r[colMonth!] ?? ""));

      if (!mes || Number.isNaN(ocup)) return null;

      const record = {
        mes,
        distrito,
        ocupacion_pct: Math.max(0, Math.min(100, ocup)),
      };

      const v = outSchema.safeParse(record);
      if (!v.success) return null;
      return v.data;
    })
    .filter(Boolean);

  fs.mkdirSync("data/clean", { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(out, null, 2), "utf-8");

  const distritos = Array.from(new Set(out.map((r) => r!.distrito))).sort();
  const meses = Array.from(new Set(out.map((r) => r!.mes))).sort();

  console.log(
    JSON.stringify(
      {
        ok: true,
        filas: out.length,
        distritos: distritos.slice(0, 8),
        meses: `${meses[0]} … ${meses[meses.length - 1]}`,
        cols_detectadas: { colFecha, colYear, colMonth, colDistrito, colOcup },
      },
      null,
      2
    )
  );
}

main();
