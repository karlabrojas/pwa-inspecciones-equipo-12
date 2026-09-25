// Logica de carga/busqueda de inspecciones, extraida para permitir pruebas
// deterministas sin depender de un renderer de React (no hay jsdom/Playwright
// instalados en el proyecto). Refleja el comportamiento usado por
// src/app/page.tsx y src/app/inspecciones/[id]/page.tsx.
//
// Ver docs/rendering-decision.md para el detalle de esta decision (limite:
// esto prueba la logica, no el DOM renderizado).

import { inspections, type Inspection } from "./inspections.ts";

export type InspectionLoadStatus = "loading" | "success" | "not-found" | "error";

export type InspectionLoadResult = {
  status: InspectionLoadStatus;
  inspection: Inspection | null;
};

const DEFAULT_DELAY_MS = 500;

/** Devuelve la lista completa de inspecciones sinteticas (usado por el listado). */
export function getInspectionsList(): Inspection[] {
  return inspections;
}

/** Busca una inspeccion por id. Devuelve null si no existe (id inexistente). */
export function findInspectionById(id: string): Inspection | null {
  return inspections.find((item) => item.id === id) ?? null;
}

/**
 * Simula la carga asincrona usada por la pagina de detalle (setTimeout).
 * delayMs configurable para que las pruebas no dependan de esperar 500ms reales.
 */
export function loadInspectionById(
  id: string,
  delayMs: number = DEFAULT_DELAY_MS
): Promise<InspectionLoadResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const inspection = findInspectionById(id);
      resolve({
        status: inspection ? "success" : "not-found",
        inspection,
      });
    }, delayMs);
  });
}

/** Simula el estado de error activado por el boton "Simular error" de la UI. */
export function loadInspectionWithError(
  delayMs: number = DEFAULT_DELAY_MS
): Promise<InspectionLoadResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ status: "error", inspection: null });
    }, delayMs);
  });
}

