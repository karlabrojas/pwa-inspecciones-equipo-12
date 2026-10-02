import type { Inspection } from "../data/inspections.ts";
import type { ConflictResolutionPolicy, InspectionConflict } from "../storage/schema.ts";

/**
 * Politica de resolucion de conflictos: "manual".
 *
 * Un conflicto ocurre cuando la version del servidor avanzo desde la ultima
 * vez que el cliente la conocio (serverVersion), Y ADEMAS el cambio local y
 * el remoto son distintos entre si. Si el servidor avanzo pero el contenido
 * es identico al que el cliente ya tiene, no hay nada que resolver.
 *
 * Al detectarse un conflicto NINGUNA version se descarta automaticamente:
 * se conserva el cambio local (no se sobrescribe con el remoto) y se marca
 * syncStatus = "conflict" para que una persona decida. Esto evita perder
 * informacion de un reporte de inspeccion, que es mas grave que mostrar un
 * conflicto pendiente.
 */
export const DEFAULT_CONFLICT_RESOLUTION_POLICY: ConflictResolutionPolicy = "manual";

export type ConflictCheckInput = {
  local: Inspection;
  localKnownServerVersion: number | null;
  remote: Inspection;
  remoteVersion: number;
  remoteUpdatedAt: string | null;
};

function sameContent(a: Inspection, b: Inspection): boolean {
  // Comparacion por contenido, no por referencia: dos objetos distintos con
  // los mismos valores no deben marcarse como conflicto.
  return JSON.stringify(a) === JSON.stringify(b);
}

export function detectConflict(input: ConflictCheckInput): boolean {
  const { local, localKnownServerVersion, remote, remoteVersion } = input;
  const serverAdvanced =
    localKnownServerVersion === null || remoteVersion > localKnownServerVersion;
  if (!serverAdvanced) return false;
  return !sameContent(local, remote);
}

export type ConflictResolution = {
  conflict: InspectionConflict;
  resolvedInspection: Inspection;
};

/**
 * Aplica la politica "manual": conserva el contenido local y produce el
 * registro de conflicto que debe guardarse junto a la inspeccion.
 */
export function resolveConflict(
  input: ConflictCheckInput,
  detectedAt: string,
  policy: ConflictResolutionPolicy = DEFAULT_CONFLICT_RESOLUTION_POLICY,
): ConflictResolution {
  const conflict: InspectionConflict = {
    detectedAt,
    serverVersion: input.remoteVersion,
    serverUpdatedAt: input.remoteUpdatedAt,
    resolutionPolicy: policy,
  };

  switch (policy) {
    case "manual":
    case "local-wins":
      return { conflict, resolvedInspection: input.local };
    case "server-wins":
      return { conflict, resolvedInspection: input.remote };
  }
}
