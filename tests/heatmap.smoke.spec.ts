import { test, expect } from "@playwright/test";

test.describe("heatmap (smoke)", () => {
  test("estructura básica y accesible", async ({ page }) => {
    await page.goto("/heatmap");

    // existe la tabla identificable por testid
    const table = page.getByTestId("heatmap-table");
    await expect(table).toBeVisible();

    // 12 meses + columna "año"
    await expect(table.getByRole("columnheader")).toHaveCount(13);

    // al menos 5 filas de años (header + >=5 filas => total >=6 filas)
    const rows = await table.getByRole("row").all();
    expect(rows.length).toBeGreaterThanOrEqual(6);

    const someCell = table.getByRole("button").first();
    await expect(someCell).toBeVisible();
    await expect(someCell).toHaveAttribute(
      "aria-label",
      /^(20\d{2}|1999)-\d{2}:/
    );
  });
});
