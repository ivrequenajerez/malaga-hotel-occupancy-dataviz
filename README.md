````markdown
# malaga-hotel-occupancy-dataviz

visualización de la **ocupación hotelera de málaga** por mes y por distrito. stack moderno con **next.js (app router, typescript)** y gráficos con **recharts**, orientado a **rendimiento (core web vitals)**, **seo/ssg**, **accesibilidad** y **tests**.

> objetivo: repo corto y claro que demuestre ingestión de opendata, limpieza mínima y una visualización útil para decisiones.

---

## demo
- deploy: _pendiente_ (vercel)
- captura: _pendiente_ (`/public/preview.png`)

---

## datos
- fuente: datos abiertos del ayuntamiento de málaga — **ocupación hotelera**  
  https://opendata.malaga.es/dataset/ocupacionhotelera  
- formatos disponibles: csv, json, xlsx, xml  
- este repo usa un script para dejar un **json “largo/ordenado”** en `data/clean/ocupacion.json` con esquema:
  ```ts
  { mes: "yyyy-mm", distrito: "centro|este|...", ocupacion_pct: number } // 0–100
````

---

## stack

* **next.js** (app router, **ssg** con `revalidate`)
* **typescript**
* **recharts** (bar chart; heatmap en roadmap)
* **dayjs**, **papaparse**, **zod** (parseo/validación)
* **testing**: **vitest** + **testing-library** (unit), **playwright** (e2e)
* **tailwind css** (utilidades y a11y visual)

---

## por qué interesa a un reclutador (xceed-style)

* **ssr/ssg + seo**: páginas públicas generadas de forma estática con revalidación.
* **core web vitals**: fuente con `next/font`, layout estable (altura fija del gráfico), bundle mínimo.
* **accesibilidad**: skip-link, roles/labels en el gráfico, contraste y foco visibles.
* **tests**: unit (vitest + rtl) y base para e2e (playwright).
* **data pipeline simple**: ingestión → validación → json limpio → visualización.

---

## estructura

```
.
├─ data/
│  ├─ raw/           # ficheros originales (no comitear grandes)
│  └─ clean/         # salida normalizada (ocupacion.json)
├─ scripts/
│  └─ prepare_data.ts # descarga/parseo/validación/export
├─ src/
│  ├─ app/
│  │  └─ page.tsx    # página principal (ssg + revalidate)
│  ├─ components/
│  │  └─ OcupacionBars.tsx
│  └─ lib/
│     └─ types.ts
├─ tests/            # e2e (playwright) – separado de unit
├─ vitest.config.ts
├─ vitest.setup.ts
└─ README.md
```

---

## empezar (local)

**requisitos**: node 18+ (recomendado 20 lts)

```bash
# instalar dependencias
npm i

# (opcional) preparar datos reales desde csv
npx tsx scripts/prepare_data.ts

# desarrollo
npm run dev
# abre http://localhost:3000
```

---

## scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "prepare:data": "tsx scripts/prepare_data.ts",
  "test": "vitest",
  "test:run": "vitest run",
  "e2e": "playwright test"
}
```

---

## visualizaciones

* **barras por mes (comparación distritos)**: vista principal (interactiva con leyenda).
* **roadmap**:

  * heatmap mes × distrito (color por % ocupación)
  * selector de año y media móvil 3m
  * modo alto contraste y navegación solo teclado

---

## calidad

* **a11y** (wcag quick checklist)

  * [ ] skip to content
  * [ ] foco visible en elementos interactivos
  * [ ] nombres accesibles/aria-label en el gráfico
  * [ ] contraste suficiente para texto e indicadores
* **rendimiento & cwv**

  * [ ] `next/font` para evitar cls
  * [ ] altura fija del contenedor del gráfico
  * [ ] ssg con `revalidate` para páginas públicas
  * [ ] evitar librerías innecesarias en la home

---

## tests

* **unit** (vitest + rtl): `npm test`
* **e2e** (playwright): `npm run build && npm start` y luego `npm run e2e`

---

## licencia

* código: mit
* datos: según licencia del portal de datos abiertos del ayuntamiento de málaga. revisa los términos de uso antes de redistribuir.

---

