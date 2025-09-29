import fs from "node:fs";
import path from "node:path";
import OcupacionBars from "../components/OcupacionBars";
import type { RegistroOcupacion } from "../lib/types";

export const revalidate = 3600; // ssg con revalidación

export default async function Page() {
  const file = path.join(process.cwd(), "data/clean/ocupacion.json");
  const raw = fs.readFileSync(file, "utf-8");
  const data: RegistroOcupacion[] = JSON.parse(raw);

  return (
    <main id="contenido" className="p-6 max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">ocupación hotelera · málaga</h1>
        <p className="text-neutral-600">comparación por distrito (barras por mes)</p>
      </header>
      <OcupacionBars data={data} />
    </main>
  );
}
