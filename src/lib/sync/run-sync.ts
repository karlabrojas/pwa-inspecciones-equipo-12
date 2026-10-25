import {
  createSyncQueueStorage,
  openInspectionDatabase,
} from "../storage/indexed-db";
import { INSPECTIONS_STORE, type StoredInspection } from "../storage/schema";
import {
  SyncQueue,
  type ProcessQueueResult,
  type SyncOperation,
} from "./queue";

/**
 * IMPORTANTE: debe existir UNA sola instancia de SyncQueue en la aplicación.
 * El bloqueo de procesamiento (processLock) y activeOperations viven en la
 * instancia; si cada disparo creara su propia cola, esas protecciones no
 * se compartirían.
 */
let queue: SyncQueue | undefined;

function getQueue(): SyncQueue {
  if (!queue) {
    queue = new SyncQueue(createSyncQueueStorage());
  }

  return queue;
}

async function markInspectionSynced(
  inspectionId: string,
  serverVersion: number | null,
): Promise<void> {
  const database = await openInspectionDatabase();
  const transaction = database.transaction(INSPECTIONS_STORE, "readwrite");
  const store = transaction.objectStore(INSPECTIONS_STORE);
  const request = store.get(inspectionId);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const current = request.result as StoredInspection | undefined;

      if (!current) {
        return;
      }

      store.put({
        ...current,
        syncStatus: "synced",
        serverVersion,
        syncedAt: new Date().toISOString(),
        conflict: null,
      } satisfies StoredInspection);
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(
        transaction.error ??
          new Error("No se pudo actualizar el estado de la inspección."),
      );
    transaction.onabort = () =>
      reject(
        transaction.error ??
          new Error("Se canceló la actualización de la inspección."),
      );
  });
}

async function sendOperation(operation: SyncOperation): Promise<void> {
  const response = await fetch("/api/inspections", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": operation.operationId,
    },
    body: JSON.stringify({
      type: operation.type,
      inspection: operation.payload,
    }),
  });

  if (!response.ok) {
    throw new Error(`El servidor respondió ${response.status}.`);
  }

  const data = (await response.json()) as { version?: number };

  await markInspectionSynced(operation.inspectionId, data.version ?? null);
}

/**
 * Procesa las operaciones pendientes. Sin conexión no intenta nada
 * (las operaciones permanecen pendientes en IndexedDB).
 */
export async function syncPendingInspections(): Promise<ProcessQueueResult | null> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return null;
  }

  return getQueue().process(sendOperation);
}
