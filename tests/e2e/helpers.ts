import {
  expect,
  type APIRequestContext,
  type BrowserContext,
  type Locator,
  type Page,
} from "@playwright/test";

export const RUTA = "/inspecciones";
export const API_INSPECCIONES = "/api/inspections";

/** Base IndexedDB y store (src/lib/storage/schema.ts). */
export const IDB = { nombre: "pwa-inspecciones", store: "inspections" };

/** Pon en false si cambias el esquema local. */
export const VERIFICAR_IDB = true;

export const UI = {
  campoLaboratorio: (p: Page) => p.getByLabel("Laboratorio", { exact: true }),
  campoTitulo: (p: Page) => p.getByLabel("Título", { exact: true }),
  campoResponsable: (p: Page) => p.getByLabel("Responsable", { exact: true }),
  guardar: (p: Page) => p.getByRole("button", { name: /guardar inspección/i }),
  botonSincronizar: (p: Page) =>
    p.getByRole("button", { name: /sincronizar ahora/i }),
  fila: (p: Page) => p.getByTestId("inspeccion-item"),
  textoPendiente: /pendiente de sincronizar/i,
  textoSincronizado: /sincronizada/i,
};

export const tituloUnico = (prefijo: string) =>
  `${prefijo}-${Date.now()}-${Math.floor(Math.random() * 10_000)}`;

export const filasCon = (page: Page, titulo: string): Locator =>
  UI.fila(page).filter({ hasText: titulo });

/** Carga online, espera al Service Worker y recarga para que controle la página. */
export async function prepararOnline(page: Page) {
  await page.goto(RUTA);
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await page.reload();
  const controlado = await page.evaluate(
    () => !!navigator.serviceWorker.controller,
  );
  expect(
    controlado,
    "El Service Worker no controla la página: sin él no se puede recargar offline.",
  ).toBe(true);
  await expect(UI.guardar(page)).toBeVisible();
}

export async function crearInspeccion(page: Page, titulo: string) {
  await UI.campoLaboratorio(page).fill("Laboratorio de pruebas (sintético)");
  await UI.campoTitulo(page).fill(titulo);
  await UI.campoResponsable(page).fill("Persona de pruebas");
  await UI.guardar(page).click();
  // Espera a que el guardado local termine antes de seguir (p. ej. recargar).
  await expect(filasCon(page, titulo)).toHaveCount(1);
}

export const irOffline = (context: BrowserContext) => context.setOffline(true);

/** Reconecta y dispara la sincronización `veces` veces (evento online + botón). */
export async function reconectarYSincronizar(
  page: Page,
  context: BrowserContext,
  veces = 1,
) {
  await context.setOffline(false);
  for (let i = 0; i < veces; i++) {
    await page.evaluate(() => window.dispatchEvent(new Event("online")));
    await UI.botonSincronizar(page).click();
  }
}

/** Cuenta registros de IndexedDB cuyo contenido incluye el título. */
export async function contarEnIndexedDB(
  page: Page,
  titulo: string,
): Promise<number> {
  return page.evaluate(
    ({ nombre, store, titulo }) =>
      new Promise<number>((resolve, reject) => {
        const abrir = indexedDB.open(nombre);
        abrir.onerror = () => reject(abrir.error);
        abrir.onsuccess = () => {
          const db = abrir.result;
          try {
            const req = db
              .transaction(store, "readonly")
              .objectStore(store)
              .getAll();
            req.onsuccess = () => {
              db.close();
              resolve(
                req.result.filter((v) => JSON.stringify(v).includes(titulo))
                  .length,
              );
            };
            req.onerror = () => reject(req.error);
          } catch (e) {
            db.close();
            reject(e);
          }
        };
      }),
    { ...IDB, titulo },
  );
}

/**
 * Lee lo que recibió el servidor (src/app/api/inspections/route.ts).
 * - inspecciones: inspecciones distintas con ese título
 * - envios: veces que llegó una operación (suma de `receipts`)
 */
export async function leerServidor(request: APIRequestContext, titulo: string) {
  const respuesta = await request.get(API_INSPECCIONES);
  expect(respuesta.ok(), "GET /api/inspections falló").toBe(true);

  const { items } = (await respuesta.json()) as {
    items: { receipts: number; inspection?: { title?: string } }[];
  };
  const propias = items.filter((item) => item.inspection?.title === titulo);

  return {
    inspecciones: propias.length,
    envios: propias.reduce((total, item) => total + item.receipts, 0),
  };
}

/** Recoge errores no capturados de la página (deben ser 0). */
export function registrarErroresDePagina(page: Page): string[] {
  const errores: string[] = [];
  page.on("pageerror", (e) => errores.push(e.message));
  return errores;
}
