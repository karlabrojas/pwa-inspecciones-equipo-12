import test from "node:test";
import assert from "node:assert/strict";
import { SyncQueue } from "../../src/lib/sync/queue.ts";
import { createMemoryStorage, sampleInspection } from "../sync-test-helpers.mjs";

test("cola: encolar y procesar dos veces una operación no la duplica", async () => {
  const storage = createMemoryStorage();
  const queue = new SyncQueue(storage);
  const payload = sampleInspection();

  const firstEnqueue = await queue.enqueue({
    operationId: "unit-operation-1",
    inspectionId: payload.id,
    type: "create",
    payload,
  });
  const repeatedEnqueue = await queue.enqueue({
    operationId: "unit-operation-1",
    inspectionId: payload.id,
    type: "create",
    payload: sampleInspection({ title: "Otro título" }),
  });

  assert.equal(repeatedEnqueue.createdAt, firstEnqueue.createdAt);
  assert.equal((await storage.getAll()).length, 1);
  assert.deepEqual(repeatedEnqueue.payload, payload);

  let handlerCalls = 0;
  const handler = async () => {
    handlerCalls += 1;
  };

  assert.deepEqual(await queue.process(handler), {
    processed: 1,
    failed: 0,
    skipped: 0,
  });
  assert.deepEqual(await queue.process(handler), {
    processed: 0,
    failed: 0,
    skipped: 0,
  });
  assert.equal(handlerCalls, 1);
  assert.equal((await storage.get("unit-operation-1"))?.status, "completed");
});
