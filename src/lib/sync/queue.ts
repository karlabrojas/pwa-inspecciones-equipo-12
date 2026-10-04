import type { Inspection } from "../data/inspections.ts";

export type SyncOperationType = "create" | "update";

export type SyncOperationStatus =
  | "pending"
  | "processing"
  | "failed"
  | "completed";

export type SyncOperation = {
  operationId: string;
  inspectionId: string;
  type: SyncOperationType;
  payload: Inspection;
  status: SyncOperationStatus;
  attempts: number;
  attemptId: string | null;
  createdAt: string;
  updatedAt: string;
  lastAttemptAt: string | null;
  nextAttemptAt: string | null;
  lastError: string | null;
};

export type QueueStorage = {
  getAll(): Promise<SyncOperation[]>;
  get(operationId: string): Promise<SyncOperation | null>;
  put(operation: SyncOperation): Promise<void>;
  delete(operationId: string): Promise<void>;
};

export type SyncHandler = (operation: SyncOperation) => Promise<void>;

export type EnqueueInput = {
  operationId: string;
  inspectionId: string;
  type: SyncOperationType;
  payload: Inspection;
};

export type ProcessQueueResult = {
  processed: number;
  failed: number;
  skipped: number;
};

function now(): string {
  return new Date().toISOString();
}

function createAttemptId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Cola de sincronización offline.
 *
 * La cola no depende directamente de IndexedDB.
 * Recibe un adaptador mediante QueueStorage.
 */
export class SyncQueue {
  private readonly storage: QueueStorage;

  /**
   * Evita que dos llamadas concurrentes al mismo SyncQueue
   * procesen simultáneamente la misma operación.
   */
  private readonly activeOperations = new Set<string>();

  /**
   * Serializa las llamadas a process() dentro de la misma instancia.
   */
  private processLock: Promise<void> = Promise.resolve();

  public constructor(storage: QueueStorage) {
    this.storage = storage;
  }

  /**
   * Agrega una operación a la cola.
   *
   * Si operationId ya existe, no crea una segunda operación.
   */
  public async enqueue(input: EnqueueInput): Promise<SyncOperation> {
    const existing = await this.storage.get(input.operationId);

    if (existing) {
      return existing;
    }

    const timestamp = now();

    const operation: SyncOperation = {
      operationId: input.operationId,
      inspectionId: input.inspectionId,
      type: input.type,
      payload: input.payload,
      status: "pending",
      attempts: 0,
      attemptId: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      lastAttemptAt: null,
      nextAttemptAt: null,
      lastError: null,
    };

    await this.storage.put(operation);

    return operation;
  }

  /**
   * Obtiene las operaciones que pueden volver a procesarse.
   */
  public async getPending(): Promise<SyncOperation[]> {
    const operations = await this.storage.getAll();

    return operations.filter(
      (operation) =>
        operation.status === "pending" || operation.status === "failed",
    );
  }

  private async processInternal(
    handler: SyncHandler,
  ): Promise<ProcessQueueResult> {
    const operations = await this.getPending();

    let processed = 0;
    let failed = 0;
    let skipped = 0;

    for (const operation of operations) {
      if (this.activeOperations.has(operation.operationId)) {
        skipped += 1;
        continue;
      }

      const current = await this.storage.get(operation.operationId);

      if (!current) {
        skipped += 1;
        continue;
      }

      if (current.status !== "pending" && current.status !== "failed") {
        skipped += 1;
        continue;
      }

      const attemptId = createAttemptId();
      const attemptTime = now();

      const processing: SyncOperation = {
        ...current,
        status: "processing",
        attempts: current.attempts + 1,
        attemptId,
        updatedAt: attemptTime,
        lastAttemptAt: attemptTime,
        nextAttemptAt: null,
        lastError: null,
      };

      this.activeOperations.add(operation.operationId);

      await this.storage.put(processing);

      try {
        await handler(processing);

        const latest = await this.storage.get(operation.operationId);

        /**
         * Una respuesta solamente puede completar el intento
         * que continúa siendo el intento vigente.
         */
        if (
          !latest ||
          latest.status !== "processing" ||
          latest.attemptId !== attemptId
        ) {
          skipped += 1;
          continue;
        }

        const completed: SyncOperation = {
          ...latest,
          status: "completed",
          updatedAt: now(),
          lastError: null,
          nextAttemptAt: null,
        };

        await this.storage.put(completed);

        processed += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        const latest = await this.storage.get(operation.operationId);

        /**
         * Un error de un intento antiguo no puede sobrescribir
         * el estado producido por un intento posterior.
         */
        if (
          !latest ||
          latest.status !== "processing" ||
          latest.attemptId !== attemptId
        ) {
          skipped += 1;
          continue;
        }

        const failedOperation: SyncOperation = {
          ...latest,
          status: "failed",
          updatedAt: now(),
          lastError: message,
          nextAttemptAt: null,
        };

        await this.storage.put(failedOperation);

        failed += 1;
      } finally {
        this.activeOperations.delete(operation.operationId);
      }
    }

    return {
      processed,
      failed,
      skipped,
    };
  }

  public async process(handler: SyncHandler): Promise<ProcessQueueResult> {
    let release!: () => void;

    const previous = this.processLock;

    this.processLock = new Promise<void>((resolve) => {
      release = resolve;
    });

    await previous;

    try {
      return await this.processInternal(handler);
    } finally {
      release();
    }
  }
}
