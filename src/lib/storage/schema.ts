import type { Inspection } from "../data/inspections";

export const INSPECTION_DATABASE_NAME = "pwa-inspecciones";
export const INSPECTION_DATABASE_VERSION = 1;
export const INSPECTIONS_STORE = "inspections";
export const SYNC_OPERATIONS_STORE = "syncOperations";

export type InspectionSyncStatus = "pending" | "synced" | "conflict" | "failed";

export type SyncOperationStatus =
  | "pending"
  | "syncing"
  | "synced"
  | "conflict"
  | "failed";

export type SyncOperationType = "create" | "update";
export type ConflictResolutionPolicy = "manual" | "local-wins" | "server-wins";

export type InspectionConflict = {
  detectedAt: string;
  serverVersion: number;
  serverUpdatedAt: string | null;
  resolutionPolicy: ConflictResolutionPolicy;
};

export type StoredInspection = Inspection & {
  syncStatus: InspectionSyncStatus;
  version: number;
  serverVersion: number | null;
  deduplicationKey: string;
  createdAt: string;
  updatedAt: string;
  syncedAt: string | null;
  conflict: InspectionConflict | null;
};

export type SyncOperation = {
  operationId: string;
  idempotencyKey: string;
  attemptId: string | null;
  inspectionId: string;
  type: SyncOperationType;
  payload: Inspection;
  status: SyncOperationStatus;
  attempts: number;
  createdAt: string;
  updatedAt: string;
  lastAttemptAt: string | null;
  nextAttemptAt: string | null;
  lastError: string | null;
};
