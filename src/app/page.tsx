import fs from "node:fs";
import path from "node:path";
import OcupacionBars from "../components/OcupacionBars";
import type { RegistroOcupacion } from "../lib/types";

export const revalidate = 3600;

export const metadata = {
  title: "inicio",
  description: "introducción y acceso a visualizaciones de ocupación hotelera",
};

export default async function Page() {
  const file = path.join(process.cwd(), "data/clean/ocupacion.json");
  const raw = fs.readFileSync(file, "utf-8");
  const data: RegistroOcupacion[] = JSON.parse(raw);

  return (
    <main id="contenido" className="p-6 max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">
          ocupación mensual (municipio de málaga)
        </h1>
      </header>
      <OcupacionBars data={data} />
      <p className="mt-4">
        <a className="underline" href="/heatmap">
          ver heatmap año×mes →
        </a>
      </p>
    </main>
  );
}
