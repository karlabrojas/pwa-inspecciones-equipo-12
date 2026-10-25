import { test, expect } from "@playwright/test";
import { RUTA, prepararOnline, registrarErroresDePagina } from "./helpers";

test("carga sin errores y muestra el listado de inspecciones", async ({
  page,
}) => {
  const errores = registrarErroresDePagina(page);

  await page.goto(RUTA);

  await expect(
    page.getByRole("heading", { name: /inspecciones/i }).first(),
  ).toBeVisible();

  expect(errores, `Errores de página: ${errores.join(" | ")}`).toEqual([]);
});

test("declara manifest y registra un Service Worker que controla la página", async ({
  page,
}) => {
  await prepararOnline(page);

  const manifest = await page
    .locator('link[rel="manifest"]')
    .getAttribute("href");

  expect(manifest).toBeTruthy();

  const controlado = await page.evaluate(
    () => !!navigator.serviceWorker.controller,
  );

  expect(controlado).toBe(true);
});
