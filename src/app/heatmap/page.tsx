import fs from "node:fs";
import path from "node:path";
import type { RegistroOcupacion } from "../../lib/types";
import HeatmapWithControls from "../../components/HeatmapWithControls";
import Link from "next/link";

export const revalidate = 3600;

export default async function HeatmapPage() {
  const file = path.join(process.cwd(), "data/clean/ocupacion.json");
  const raw = fs.readFileSync(file, "utf-8");
  const data: RegistroOcupacion[] = JSON.parse(raw);

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold">
          ocupación hotelera · málaga (municipio)
        </h1>
        <p className="text-neutral-600">calendario año × mes (0–100%)</p>
      </header>

      <HeatmapWithControls data={data} />

      <footer className="mt-6 text-sm text-neutral-600">
        <Link href="/">← volver</Link>
      </footer>
    </main>
  );
}
