import test from "node:test";
import assert from "node:assert/strict";
import { indexedDB as memoryIndexedDB } from "fake-indexeddb";
import { sampleInspection } from "../sync-test-helpers.mjs";
import { createRemoteSyncFixture } from "../fixtures/remote-sync.mjs";

Object.defineProperty(globalThis, "indexedDB", {
  configurable: true,
  value: memoryIndexedDB,
});

const {
  createSyncQueueStorage,
  getPendingSyncOperations,
  getStoredInspections,
  saveInspection,
} = await import("../../src/lib/storage/indexed-db.ts");
const { SyncQueue } = await import("../../src/lib/sync/queue.ts");

test("offline: conserva la inspección y un reintento de sincronización no duplica el registro remoto", async () => {
  await assert.rejects(
    saveInspection(sampleInspection({ title: "   " })),
    /El título de la inspección es obligatorio\./,
  );

  const inspection = sampleInspection({
    id: "integration-offline-inspection-1",
    title: "Inspección sintética sin conexión",
    summary: "Conservada localmente durante la desconexión.",
    attachments: ["evidencia-sintetica.jpg"],
  });

  const saved = await saveInspection(inspection);
  assert.equal(saved.syncStatus, "pending");

  const [storedInspection] = await getStoredInspections();
  assert.equal(storedInspection.id, inspection.id);
  assert.equal(storedInspection.title, inspection.title);
  assert.equal(storedInspection.summary, inspection.summary);
  assert.deepEqual(storedInspection.attachments, inspection.attachments);

  const [pendingOperation] = await getPendingSyncOperations();
  assert.ok(pendingOperation);
  assert.equal(pendingOperation.inspectionId, inspection.id);
  assert.equal(pendingOperation.status, "pending");
  assert.deepEqual(pendingOperation.payload, inspection);

  const queue = new SyncQueue(createSyncQueueStorage());
  const remote = createRemoteSyncFixture({ loseFirstResponse: true });
  const handler = async (operation) => {
    const response = await remote.create(operation.operationId, operation.payload);
    assert.equal(response.status, "duplicate");
    assert.deepEqual(response.inspection, inspection);
  };

  assert.deepEqual(await queue.process(handler), {
    processed: 0,
    failed: 1,
    skipped: 0,
  });
  assert.equal(remote.inspectionCount, 1);
  assert.equal((await getPendingSyncOperations())[0].status, "failed");

  assert.deepEqual(await queue.process(handler), {
    processed: 1,
    failed: 0,
    skipped: 0,
  });
  assert.equal(remote.inspectionCount, 1);
  assert.deepEqual(remote.requests, [
    pendingOperation.operationId,
    pendingOperation.operationId,
  ]);

  const [completedOperation] = await getPendingSyncOperations();
  assert.equal(completedOperation, undefined);
});
