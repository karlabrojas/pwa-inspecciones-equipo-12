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
  reconectarYSincronizar,
  tituloUnico,
} from "./helpers";

// Estas pruebas son las que deben FALLAR al retirar la protección contra
// duplicados de SyncQueue y volver a pasar al restaurarla. Verifican por tres
// vías: interfaz, IndexedDB y servidor (cuántas veces llegó cada operación).

test.describe("Sincronización sin duplicados", () => {
  test("flujo completo: crear offline → recargar → reconectar → sincronizar → una sola inspección", async ({
    page,
    context,
    request,
  }) => {
    const titulo = tituloUnico("E2E-sync");

    await prepararOnline(page);
    await irOffline(context);
    await crearInspeccion(page, titulo);

    await page.reload();
    await expect(filasCon(page, titulo)).toHaveCount(1);
    await expect(filasCon(page, titulo)).toContainText(UI.textoPendiente);

    await reconectarYSincronizar(page, context);
    await expect(filasCon(page, titulo)).toContainText(UI.textoSincronizado, {
      timeout: 15_000,
    });

    // Una sola inspección en la interfaz, en el almacenamiento local
    // y en el servidor, y un solo envío.
    await expect(filasCon(page, titulo)).toHaveCount(1);
    if (VERIFICAR_IDB) {
      expect(await contarEnIndexedDB(page, titulo)).toBe(1);
    }
    expect(await leerServidor(request, titulo)).toEqual({
      inspecciones: 1,
      envios: 1,
    });

    // Recargar y volver a disparar la sincronización no debe reenviar nada.
    await page.reload();
    await reconectarYSincronizar(page, context);
    await page.waitForTimeout(1500);

    await expect(filasCon(page, titulo)).toHaveCount(1);
    expect(await leerServidor(request, titulo)).toEqual({
      inspecciones: 1,
      envios: 1,
    });
  });

  test("disparos repetidos de sincronización no duplican la inspección", async ({
    page,
    context,
    request,
  }) => {
    const titulo = tituloUnico("E2E-sync-multiple");

    await prepararOnline(page);
    await irOffline(context);
    await crearInspeccion(page, titulo);

    // Evento online + botón, tres veces seguidas.
    await reconectarYSincronizar(page, context, 3);
    await expect(filasCon(page, titulo)).toContainText(UI.textoSincronizado, {
      timeout: 15_000,
    });
    await page.waitForTimeout(1500);

    await expect(filasCon(page, titulo)).toHaveCount(1);
    if (VERIFICAR_IDB) {
      expect(await contarEnIndexedDB(page, titulo)).toBe(1);
    }
    expect(await leerServidor(request, titulo)).toEqual({
      inspecciones: 1,
      envios: 1,
    });
  });

  test("varias inspecciones pendientes se sincronizan una vez cada una", async ({
    page,
    context,
    request,
  }) => {
    const a = tituloUnico("E2E-multi-A");
    const b = tituloUnico("E2E-multi-B");

    await prepararOnline(page);
    await irOffline(context);
    await crearInspeccion(page, a);
    await crearInspeccion(page, b);
    await page.reload();

    await reconectarYSincronizar(page, context, 2);
    await expect(filasCon(page, a)).toContainText(UI.textoSincronizado, {
      timeout: 15_000,
    });
    await expect(filasCon(page, b)).toContainText(UI.textoSincronizado, {
      timeout: 15_000,
    });
    await page.waitForTimeout(1500);

    await expect(filasCon(page, a)).toHaveCount(1);
    await expect(filasCon(page, b)).toHaveCount(1);
    expect(await leerServidor(request, a)).toEqual({
      inspecciones: 1,
      envios: 1,
    });
    expect(await leerServidor(request, b)).toEqual({
      inspecciones: 1,
      envios: 1,
    });
  });
});
