import { test, expect } from "@playwright/test";

test("flechas navegan por el heatmap", async ({ page }) => {
  await page.goto("/heatmap");
  const table = page.getByTestId("heatmap-table");

  // enfoca la primera celda de datos que encuentre
  const firstCell = table.locator('[data-r][data-c]').first();
  await firstCell.focus();

  // mueve derecha
  await page.keyboard.press("ArrowRight");
  await expect(page.locator('[data-r="0"][data-c="1"]')).toBeFocused();

  // mueve abajo
  await page.keyboard.press("ArrowDown");
  await expect(page.locator('[data-r="1"][data-c="1"]')).toBeFocused();
});
