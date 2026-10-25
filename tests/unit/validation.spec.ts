import test from "node:test";
import assert from "node:assert/strict";
import { validateInspectionTitle } from "../../src/lib/data/inspection-validation.ts";

test("validación de inspección: acepta un título con contenido", () => {
  assert.equal(validateInspectionTitle("Revisión del equipo"), null);
  assert.equal(validateInspectionTitle("  Revisión del equipo  "), null);
});

test("validación de inspección: rechaza un título vacío o compuesto por espacios", () => {
  assert.equal(
    validateInspectionTitle(""),
    "El título de la inspección es obligatorio.",
  );
  assert.equal(
    validateInspectionTitle("   "),
    "El título de la inspección es obligatorio.",
  );
});
