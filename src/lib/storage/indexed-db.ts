import type { Inspection } from "../data/inspections";
import {
  INSPECTION_DATABASE_NAME,
  INSPECTION_DATABASE_VERSION,
  INSPECTIONS_STORE,
  SYNC_OPERATIONS_STORE,
  type StoredInspection,
  type SyncOperation,
  type SyncOperationType,
} from "./schema";

let databasePromise: Promise<IDBDatabase> | undefined;

function createId() {
  if (typeof crypto === "undefined" || !crypto.randomUUID) {
    throw new Error("Se requiere crypto.randomUUID para crear operaciones únicas.");
  }

  return crypto.randomUUID();
}

function createDeduplicationKey(inspection: Inspection) {
  return JSON.stringify([
    inspection.reporterIdentifier?.trim().toLocaleLowerCase("es-MX") ??
      inspection.inspector.trim().toLocaleLowerCase("es-MX"),
    inspection.date,
    inspection.location.trim().toLocaleLowerCase("es-MX"),
    inspection.title.trim().toLocaleLowerCase("es-MX"),
    inspection.summary.trim().toLocaleLowerCase("es-MX"),
  ]);
}

export function openInspectionDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(
      new Error("IndexedDB no está disponible en este entorno.")
    );
  }

  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(
        INSPECTION_DATABASE_NAME,
        INSPECTION_DATABASE_VERSION
      );

      request.onupgradeneeded = () => {
        const database = request.result;
        const inspectionsStore = database.objectStoreNames.contains(
          INSPECTIONS_STORE
        )
          ? request.transaction!.objectStore(INSPECTIONS_STORE)
          : database.createObjectStore(INSPECTIONS_STORE, { keyPath: "id" });

        if (!inspectionsStore.indexNames.contains("syncStatus")) {
          inspectionsStore.createIndex("syncStatus", "syncStatus");
        }
        if (!inspectionsStore.indexNames.contains("deduplicationKey")) {
          inspectionsStore.createIndex(
            "deduplicationKey",
            "deduplicationKey"
          );
        }

        const operationsStore = database.objectStoreNames.contains(
          SYNC_OPERATIONS_STORE
        )
          ? request.transaction!.objectStore(SYNC_OPERATIONS_STORE)
          : database.createObjectStore(SYNC_OPERATIONS_STORE, {
              keyPath: "operationId",
            });

        if (!operationsStore.indexNames.contains("status")) {
          operationsStore.createIndex("status", "status");
        }
        if (!operationsStore.indexNames.contains("inspectionId")) {
          operationsStore.createIndex("inspectionId", "inspectionId");
        }
        if (!operationsStore.indexNames.contains("idempotencyKey")) {
          operationsStore.createIndex("idempotencyKey", "idempotencyKey", {
            unique: true,
          });
        }
      };

      request.onsuccess = () => {
        const database = request.result;
        database.onversionchange = () => {
          database.close();
          databasePromise = undefined;
        };
        resolve(database);
      };
      request.onerror = () => {
        databasePromise = undefined;
        reject(request.error ?? new Error("No se pudo abrir IndexedDB."));
      };
      request.onblocked = () => {
        databasePromise = undefined;
        reject(new Error("La actualización de IndexedDB está bloqueada."));
      };
    });
  }

  return databasePromise;
}

export async function saveInspection(
  inspection: Inspection,
  type: SyncOperationType = "create"
): Promise<StoredInspection> {
  const database = await openInspectionDatabase();
  const transaction = database.transaction(
    [INSPECTIONS_STORE, SYNC_OPERATIONS_STORE],
    "readwrite"
  );
  const inspectionsStore = transaction.objectStore(INSPECTIONS_STORE);
  const operationsStore = transaction.objectStore(SYNC_OPERATIONS_STORE);
  const existingRequest = inspectionsStore.get(inspection.id);
  const operationId = createId();
  const now = new Date().toISOString();
  let savedInspection: StoredInspection | undefined;

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      if (savedInspection) resolve(savedInspection);
      else reject(new Error("No se guardó la inspección."));
    };
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("No se pudo guardar la inspección."));
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("Se canceló el guardado de la inspección."));

    existingRequest.onsuccess = () => {
      const existing = existingRequest.result as StoredInspection | undefined;
      if (type === "update" && !existing) {
        transaction.abort();
        return;
      }

      const record: StoredInspection = {
        ...inspection,
        syncStatus: "pending",
        version: (existing?.version ?? 0) + 1,
        serverVersion: existing?.serverVersion ?? null,
        deduplicationKey: createDeduplicationKey(inspection),
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        syncedAt: null,
        conflict: null,
      };
      const operation: SyncOperation = {
        operationId,
        idempotencyKey: operationId,
        inspectionId: inspection.id,
        type,
        payload: inspection,
        status: "pending",
        attempts: 0,
        createdAt: now,
        updatedAt: now,
        lastAttemptAt: null,
        nextAttemptAt: null,
        lastError: null,
      };

      inspectionsStore.put(record);
      operationsStore.add(operation);
      savedInspection = record;
    };
    existingRequest.onerror = () => transaction.abort();
  });
}

export async function getStoredInspections(): Promise<StoredInspection[]> {
  const database = await openInspectionDatabase();
  const transaction = database.transaction(INSPECTIONS_STORE, "readonly");
  const request = transaction.objectStore(INSPECTIONS_STORE).getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = () =>
      resolve((request.result as StoredInspection[]).sort((left, right) =>
        right.updatedAt.localeCompare(left.updatedAt)
      ));
    request.onerror = () =>
      reject(request.error ?? new Error("No se pudieron leer las inspecciones."));
  });
}

export async function getPendingSyncOperations(): Promise<SyncOperation[]> {
  const database = await openInspectionDatabase();
  const transaction = database.transaction(SYNC_OPERATIONS_STORE, "readonly");
  const request = transaction.objectStore(SYNC_OPERATIONS_STORE).getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const operations = request.result as SyncOperation[];
      resolve(
        operations
          .filter((operation) =>
            ["pending", "syncing", "failed"].includes(operation.status)
          )
          .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
      );
    };
    request.onerror = () =>
      reject(request.error ?? new Error("No se pudieron leer las operaciones."));
  });
}

export async function findDuplicateInspections(
  inspection: Inspection
): Promise<StoredInspection[]> {
  const database = await openInspectionDatabase();
  const transaction = database.transaction(INSPECTIONS_STORE, "readonly");
  const index = transaction
    .objectStore(INSPECTIONS_STORE)
    .index("deduplicationKey");
  const request = index.getAll(createDeduplicationKey(inspection));

  return new Promise((resolve, reject) => {
    request.onsuccess = () =>
      resolve(
        (request.result as StoredInspection[]).filter(
          (storedInspection) => storedInspection.id !== inspection.id
        )
      );
    request.onerror = () =>
      reject(request.error ?? new Error("No se pudieron buscar duplicados."));
  });
}
