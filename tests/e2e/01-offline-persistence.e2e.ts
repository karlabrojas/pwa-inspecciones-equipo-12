import { test, expect } from "@playwright/test";
import {
  UI,
  VERIFICAR_IDB,
  contarEnIndexedDB,
  crearInspeccion,
  filasCon,
  irOffline,
  leerServidor,
  prepararOnline,
  tituloUnico,
} from "./helpers";

test.describe("Persistencia offline", () => {
  test("una inspección creada sin conexión se guarda y sobrevive a la recarga", async ({
    page,
    context,
    request,
  }) => {
    const titulo = tituloUnico("E2E-persistencia");

    await prepararOnline(page);
    await irOffline(context);

    await crearInspeccion(page, titulo);
    await expect(filasCon(page, titulo)).toContainText(UI.textoPendiente);

    // Recarga SIN conexión: la app debe abrir desde caché y conservar el dato.
    await page.reload();
    await expect(filasCon(page, titulo)).toHaveCount(1);
    await expect(filasCon(page, titulo)).toContainText(UI.textoPendiente);

    if (VERIFICAR_IDB) {
      expect(await contarEnIndexedDB(page, titulo)).toBe(1);
    }

    // Sin conexión no pudo llegar nada al servidor.
    expect(await leerServidor(request, titulo)).toEqual({
      inspecciones: 0,
      envios: 0,
    });
  });

  test("varias inspecciones offline persisten sin mezclarse ni perderse", async ({
    page,
    context,
  }) => {
    const a = tituloUnico("E2E-A");
    const b = tituloUnico("E2E-B");

    await prepararOnline(page);
    await irOffline(context);

    await crearInspeccion(page, a);
    await crearInspeccion(page, b);
    await page.reload();

    await expect(filasCon(page, a)).toHaveCount(1);
    await expect(filasCon(page, b)).toHaveCount(1);
  });

  test("los datos siguen ahí tras recargar dos veces sin conexión", async ({
    page,
    context,
  }) => {
    const titulo = tituloUnico("E2E-doble-recarga");

    await prepararOnline(page);
    await irOffline(context);
    await crearInspeccion(page, titulo);

    await page.reload();
    await page.reload();
    await expect(filasCon(page, titulo)).toHaveCount(1);
  });
});
