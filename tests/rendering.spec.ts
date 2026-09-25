/**
 * Issue #20 - Pruebas de renderizado (listado y detalle de inspecciones).
 *
 * No existe jsdom ni Playwright instalados en el proyecto, asi que estas
 * pruebas no renderizan JSX. En su lugar ejercitan la logica de carga y
 * busqueda que usan src/app/page.tsx y src/app/inspecciones/[id]/page.tsx,
 * extraida en src/lib/data/inspection-view.ts. Son deterministas, no usan
 * red ni servicios privados y usan solo datos sinteticos.
 *
 * Ejecutar: node --experimental-strip-types tests/rendering.spec.ts
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
  getInspectionsList,
  findInspectionById,
  loadInspectionById,
  loadInspectionWithError,
} from "../src/lib/data/inspection-view.ts";

// --- Listado ---

test("listado: devuelve todas las inspecciones sinteticas con campos requeridos", () => {
  const data = getInspectionsList();

  assert.ok(data.length > 0, "el listado no deberia estar vacio");

  for (const inspection of data) {
    assert.ok(inspection.id, "cada inspeccion debe tener id");
    assert.ok(inspection.location, "cada inspeccion debe tener location");
    assert.ok(inspection.date, "cada inspeccion debe tener date");
    assert.ok(inspection.inspector, "cada inspeccion debe tener inspector");
    assert.ok(
      inspection.status === "ok" || inspection.status === "attention",
      "status debe ser 'ok' o 'attention'"
    );
  }
});

// Regresion relevante: si alguien duplica un id al agregar datos sinteticos,
// la pagina de detalle podria mostrar informacion incorrecta o ambigua.
test("regresion: no existen ids duplicados en el listado", () => {
  const data = getInspectionsList();
  const ids = data.map((item) => item.id);
  const idsUnicos = new Set(ids);

  assert.equal(
    idsUnicos.size,
    ids.length,
    "se encontraron ids duplicados en las inspecciones sinteticas"
  );
});

// --- Detalle ---

test("detalle: encuentra una inspeccion existente por id", () => {
  const data = getInspectionsList();
  const idExistente = data[0].id;

  const encontrada = findInspectionById(idExistente);

  assert.notEqual(encontrada, null);
  assert.equal(encontrada?.id, idExistente);
});

// Criterio de aceptacion: comportamiento ante un id inexistente.
test("detalle: id inexistente devuelve null, no lanza excepcion", () => {
  const resultado = findInspectionById("id-que-no-existe-123");

  assert.equal(resultado, null);
});

// --- Estado de carga ---

test("estado de carga: la promesa esta pendiente antes de que se cumpla el delay simulado", async () => {
  const data = getInspectionsList();
  const idExistente = data[0].id;

  let resuelto = false;
  const promesa = loadInspectionById(idExistente, 50).then((r) => {
    resuelto = true;
    return r;
  });

  // Justo despues de invocar, la promesa todavia no debe haberse resuelto:
  // esto representa el estado "loading" que la UI muestra mientras espera.
  assert.equal(resuelto, false);

  const resultado = await promesa;
  assert.equal(resuelto, true);
  assert.equal(resultado.status, "success");
});

// --- Estado de error ---

test("estado de error: loadInspectionWithError resuelve status 'error' sin inspeccion", async () => {
  const resultado = await loadInspectionWithError(10);

  assert.equal(resultado.status, "error");
  assert.equal(resultado.inspection, null);
});

// --- Carga con id inexistente (combina detalle + estado) ---

test("carga con id inexistente resuelve status 'not-found'", async () => {
  const resultado = await loadInspectionById("id-que-no-existe-123", 10);

  assert.equal(resultado.status, "not-found");
  assert.equal(resultado.inspection, null);
});
