import test from "node:test";
import assert from "node:assert/strict";
import "fake-indexeddb/auto";

import {
  saveInspection,
  getStoredInspections,
  getPendingSyncOperations,
  findDuplicateInspections,
} from "../src/lib/storage/indexed-db.ts";

import { sampleInspection } from "./sync-test-helpers.mjs";

test("integración: guarda una inspección en IndexedDB y permite recuperarla", async () => {
  const inspection = sampleInspection();
  await saveInspection(inspection);

  const stored = await getStoredInspections();
  const saved = stored.find((item) => item.id === inspection.id);

  assert.ok(saved, "La inspección debe estar guardada");
  assert.equal(saved.syncStatus, "pending");
});

test("integración: guardar una inspección genera una operación pendiente", async () => {
  const inspection = sampleInspection({
    id: "inspection-pendiente-1",
  });

  await saveInspection(inspection);

  const pending = await getPendingSyncOperations();
  const operation = pending.find((item) => item.inspectionId === inspection.id);

  assert.ok(operation, "Debe existir una operación para esta inspección");
  assert.equal(operation.status, "pending");
});

test("integración: encuentra otra inspección con datos equivalentes", async () => {
  const first = sampleInspection({
    id: "inspection-duplicada-1",
  });

  const second = sampleInspection({
    id: "inspection-duplicada-2",
  });

  await saveInspection(first);

  const duplicates = await findDuplicateInspections(second);

  assert.ok(
    duplicates.some((item) => item.id === first.id),
    "Debe encontrar la inspección anterior con datos equivalentes",
  );
});
