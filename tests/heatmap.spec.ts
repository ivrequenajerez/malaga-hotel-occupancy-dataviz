import { test, expect } from "@playwright/test";

test.describe("heatmap", () => {
  test("renderiza tabla con 12 meses y al menos 5 filas", async ({ page }) => {
    await page.goto("/heatmap", { waitUntil: "networkidle" });

    const table = page.getByTestId("heatmap-table");
    await expect(table).toBeVisible({ timeout: 15_000 });

    // columnas: 1 (año) + 12 meses
    await expect(table.locator("thead th")).toHaveCount(13);

    // filas de datos: >= 5 (años)
    const rows = await table.locator("tbody tr").count();
    expect(rows).toBeGreaterThanOrEqual(5);

    // check accesible simple en una celda
    const anyCell = table.getByRole("img").first();
    await expect(anyCell).toHaveAttribute("aria-label", /20\d{2}-\d{2}/);
  });
});
