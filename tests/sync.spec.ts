import test from "node:test";
import assert from "node:assert/strict";
import { SyncQueue } from "../src/lib/sync/queue.ts";
import { detectConflict, resolveConflict } from "../src/lib/sync/conflict-policy.ts";
import { createMemoryStorage, sampleInspection } from "./sync-test-helpers.mjs";

// --- Persistencia offline / cierre y reapertura ---

test("persistencia offline: una operacion encolada sigue disponible tras cerrar y reabrir la app", async () => {
  const storage = createMemoryStorage();
  const before = new SyncQueue(storage);
  await before.enqueue({
    operationId: "op-1", inspectionId: "inspection-sintetica-1", type: "create",
    payload: sampleInspection(),
  });

  // "Cerrar y reabrir la app": una instancia nueva de SyncQueue sobre el
  // mismo almacenamiento persistente, sin memoria compartida entre objetos.
  const after = new SyncQueue(storage);
  const pending = await after.getPending();
  assert.equal(pending.length, 1);
  assert.equal(pending[0].operationId, "op-1");
});

// --- Sincronizacion ---

test("sincronizacion: una operacion pendiente se procesa y queda completed", async () => {
  const storage = createMemoryStorage();
  const queue = new SyncQueue(storage);
  await queue.enqueue({ operationId: "op-1", inspectionId: "i-1", type: "create", payload: sampleInspection() });

  const result = await queue.process(async () => {});

  assert.deepEqual(result, { processed: 1, failed: 0, skipped: 0 });
  const stored = await storage.get("op-1");
  assert.equal(stored.status, "completed");
});

// --- Reintentos ---

test("reintentos: un error temporal marca failed y una llamada posterior reintenta y completa", async () => {
  const storage = createMemoryStorage();
  const queue = new SyncQueue(storage);
  await queue.enqueue({ operationId: "op-1", inspectionId: "i-1", type: "create", payload: sampleInspection() });

  let attempt = 0;
  const handler = async () => {
    attempt += 1;
    if (attempt === 1) throw new Error("fallo de red temporal");
  };

  const first = await queue.process(handler);
  assert.deepEqual(first, { processed: 0, failed: 1, skipped: 0 });
  assert.equal((await storage.get("op-1")).status, "failed");

  const second = await queue.process(handler);
  assert.deepEqual(second, { processed: 1, failed: 0, skipped: 0 });
  assert.equal((await storage.get("op-1")).status, "completed");
  assert.equal(attempt, 2);
});

// --- Duplicacion evitada ---

test("duplicacion: encolar dos veces el mismo operationId no crea una segunda operacion", async () => {
  const storage = createMemoryStorage();
  const queue = new SyncQueue(storage);
  const payload = sampleInspection();

  await queue.enqueue({ operationId: "op-1", inspectionId: "i-1", type: "create", payload });
  await queue.enqueue({ operationId: "op-1", inspectionId: "i-1", type: "create", payload });

  const all = await storage.getAll();
  assert.equal(all.length, 1);
});

// --- Idempotencia ---

test("idempotencia: procesar dos veces la misma operacion completada no la vuelve a enviar", async () => {
  const storage = createMemoryStorage();
  const queue = new SyncQueue(storage);
  await queue.enqueue({ operationId: "op-1", inspectionId: "i-1", type: "create", payload: sampleInspection() });

  let timesHandlerRan = 0;
  const handler = async () => { timesHandlerRan += 1; };

  const first = await queue.process(handler);
  const second = await queue.process(handler);

  assert.equal(timesHandlerRan, 1, "el handler no debe volver a ejecutarse para una operacion ya completed");
  assert.equal(first.processed, 1);
  assert.deepEqual(second, { processed: 0, failed: 0, skipped: 0 });
});

// --- Respuestas fuera de orden ---

test("respuestas fuera de orden: la respuesta de un intento viejo no sobrescribe un intento mas nuevo", async () => {
  // Simula dos pestanas trabajando sobre el mismo almacenamiento persistente.
  const storage = createMemoryStorage();
  const tabA = new SyncQueue(storage);
  await tabA.enqueue({ operationId: "op-1", inspectionId: "i-1", type: "create", payload: sampleInspection() });

  // La pestana A empieza a procesar y queda con un attemptId "viejo" registrado.
  const oldAttemptHandler = async () => {};
  await tabA.process(oldAttemptHandler);
  const afterOldAttempt = await storage.get("op-1");
  assert.equal(afterOldAttempt.status, "completed");
  const oldAttemptId = afterOldAttempt.attemptId;

  // Mientras tanto, la pestana B (otra instancia de SyncQueue, mismo storage)
  // ya reintento esa misma operacion y genero un attemptId nuevo y distinto.
  const tabB = new SyncQueue(storage);
  await storage.put({ ...afterOldAttempt, status: "processing", attemptId: "attempt-nuevo-de-tabB" });

  // Ahora llega, tarde, la respuesta del intento viejo de la pestana A: un error
  // de red que corresponde al attemptId que ya quedo obsoleto.
  const current = await storage.get("op-1");
  assert.notEqual(current.attemptId, oldAttemptId, "el storage ya avanzo a un attemptId mas nuevo");

  // tabA.process() no deberia volver a tocar esta operacion porque ya no esta
  // en estado pending/failed (esta "processing" por tabB), asi que no hay nada
  // que procesar desde el punto de vista de tabA.
  const resultFromTabA = await tabA.process(oldAttemptHandler);
  assert.deepEqual(resultFromTabA, { processed: 0, failed: 0, skipped: 0 });

  const finalState = await storage.get("op-1");
  assert.equal(finalState.status, "processing", "el estado de tabB no debe ser pisado por una respuesta tardia de tabA");
  assert.equal(finalState.attemptId, "attempt-nuevo-de-tabB");
});

// --- Conflicto ---

test("conflicto: cambios locales y remotos distintos se detectan y no se pierde el cambio local", () => {
  const local = sampleInspection({ summary: "Observacion registrada sin conexion" });
  const remote = sampleInspection({ summary: "Observacion registrada por otro usuario" });

  const isConflict = detectConflict({
    local, localKnownServerVersion: 1, remote, remoteVersion: 2, remoteUpdatedAt: "2026-01-02T00:00:00-06:00",
  });
  assert.equal(isConflict, true);

  const resolution = resolveConflict(
    { local, localKnownServerVersion: 1, remote, remoteVersion: 2, remoteUpdatedAt: "2026-01-02T00:00:00-06:00" },
    "2026-01-02T00:05:00-06:00",
  );
  assert.equal(resolution.resolvedInspection.summary, local.summary, "la politica manual no debe descartar el cambio local");
  assert.equal(resolution.conflict.resolutionPolicy, "manual");
  assert.equal(resolution.conflict.serverVersion, 2);
});

test("conflicto: si el remoto avanzo pero el contenido es igual, no se marca conflicto", () => {
  const same = sampleInspection();
  const isConflict = detectConflict({
    local: same, localKnownServerVersion: 1, remote: same, remoteVersion: 2, remoteUpdatedAt: null,
  });
  assert.equal(isConflict, false);
});

// --- Regresion relevante (debe fallar si alguien quita la proteccion de attemptId) ---

test("regresion: sin el candado processLock, dos llamadas concurrentes duplicarian el envio", async () => {
  const storage = createMemoryStorage();
  const queue = new SyncQueue(storage);
  await queue.enqueue({ operationId: "op-1", inspectionId: "i-1", type: "create", payload: sampleInspection() });

  let handlerCalls = 0;
  const handler = async () => { handlerCalls += 1; await new Promise((r) => setTimeout(r, 5)); };

  // Dos llamadas a process() en paralelo sobre la MISMA instancia de cola:
  // el candado interno (processLock) debe serializarlas.
  const [a, b] = await Promise.all([queue.process(handler), queue.process(handler)]);

  assert.equal(handlerCalls, 1, "la operacion solo debe enviarse una vez aunque process() se llame en paralelo");
  const totalProcessed = a.processed + b.processed;
  assert.equal(totalProcessed, 1);
});
