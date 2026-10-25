import { test, expect, type Page } from "@playwright/test";
import {
  UI,
  crearInspeccion,
  filasCon,
  irOffline,
  leerServidor,
  prepararOnline,
  reconectarYSincronizar,
  registrarErroresDePagina,
  tituloUnico,
} from "./helpers";

// Cada escenario se inyecta ANTES de que cargue la app (addInitScript).
// Las funciones deben ser autocontenidas: se serializan al navegador.
// "Ausente" elimina la propiedad (así `"x" in navigator` es false);
// "denegada" deja la API pero rechaza el permiso.
type Escenario = {
  nombre: string;
  init: () => void;
  /** Comprobación sobre la UI real, cuando la capacidad tiene pantalla. */
  verificar?: (page: Page) => Promise<void>;
};

const ESCENARIOS: Escenario[] = [
  {
    nombre: "geolocalización denegada por el usuario",
    init: () => {
      const denegar = (_ok: unknown, err?: (e: unknown) => void) =>
        err?.({
          code: 1,
          message: "User denied Geolocation",
          PERMISSION_DENIED: 1,
        });
      Object.defineProperty(navigator, "geolocation", {
        configurable: true,
        value: {
          getCurrentPosition: denegar,
          watchPosition: (ok: unknown, err?: (e: unknown) => void) => {
            denegar(ok, err);
            return 0;
          },
          clearWatch: () => undefined,
        },
      });
    },
  },
  {
    nombre: "geolocalización ausente (API inexistente)",
    init: () => {
      delete (Navigator.prototype as unknown as Record<string, unknown>)
        .geolocation;
    },
  },
  {
    nombre: "cámara denegada (getUserMedia rechaza)",
    init: () => {
      Object.defineProperty(navigator, "mediaDevices", {
        configurable: true,
        value: {
          getUserMedia: () =>
            Promise.reject(
              new DOMException("Permission denied", "NotAllowedError"),
            ),
          enumerateDevices: () => Promise.resolve([]),
        },
      });
    },
  },
  {
    nombre: "cámara ausente (mediaDevices inexistente)",
    init: () => {
      delete (Navigator.prototype as unknown as Record<string, unknown>)
        .mediaDevices;
    },
  },
  {
    nombre: "notificaciones denegadas",
    init: () => {
      const falsa = function () {} as unknown as typeof Notification;
      Object.defineProperty(falsa, "permission", { get: () => "denied" });
      (
        falsa as unknown as { requestPermission: () => Promise<string> }
      ).requestPermission = () => Promise.resolve("denied");
      Object.defineProperty(window, "Notification", {
        configurable: true,
        value: falsa,
      });
    },
    // notification-controls.tsx muestra "Permiso bloqueado" y deshabilita el botón.
    verificar: async (page) => {
      await expect(
        page.getByRole("button", { name: /permiso bloqueado/i }),
      ).toBeDisabled();
    },
  },
  {
    nombre: "notificaciones ausentes (API inexistente)",
    init: () => {
      delete (window as unknown as Record<string, unknown>).Notification;
    },
    // notification-controls.tsx informa que el navegador no admite notificaciones.
    verificar: async (page) => {
      await expect(page.getByText(/no admite notificaciones/i)).toBeVisible();
    },
  },
];

test.describe("Capacidad denegada o ausente: la captura se puede completar", () => {
  for (const escenario of ESCENARIOS) {
    test(escenario.nombre, async ({ page, context, request }) => {
      const errores = registrarErroresDePagina(page);
      const titulo = tituloUnico("E2E-sin-capacidad");

      await page.addInitScript(escenario.init);
      await prepararOnline(page);

      if (escenario.verificar) {
        await escenario.verificar(page);
      }

      // La captura se completa SIN la capacidad, incluso offline...
      await irOffline(context);
      await crearInspeccion(page, titulo);
      await expect(filasCon(page, titulo)).toHaveCount(1);

      // ...y después sincroniza una sola vez.
      await reconectarYSincronizar(page, context);
      await expect(filasCon(page, titulo)).toContainText(UI.textoSincronizado, {
        timeout: 15_000,
      });
      await expect(filasCon(page, titulo)).toHaveCount(1);
      expect(await leerServidor(request, titulo)).toEqual({
        inspecciones: 1,
        envios: 1,
      });

      // La ausencia de la capacidad no debe provocar excepciones sin controlar.
      expect(errores, `Errores de página: ${errores.join(" | ")}`).toEqual([]);
    });
  }
});
