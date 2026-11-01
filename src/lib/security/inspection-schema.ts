/**
 * Esquema centralizado de validación de entradas de inspecciones.
 *
 * Principio: toda entrada es no confiable hasta que pasa por
 * `parseInspectionInput`. Solo el `value` devuelto (objeto nuevo, con campos
 * permitidos y texto normalizado) debe guardarse, encolarse o enviarse.
 */

export const INSPECTION_LIMITS = {
  id: 100,
  title: 120,
  location: 200,
} as const;

export type InspectionInput = {
  id: string;
  title: string;
  location: string;
};

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: string[] };

const ALLOWED_KEYS: ReadonlySet<string> = new Set(["id", "title", "location"]);
const ID_PATTERN = /^[A-Za-z0-9_-]+$/;
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/;

/** Devuelve el mensaje de error del título, o null si es válido. */
function titleError(title: unknown): string | null {
  if (typeof title !== "string") {
    return "El título de la inspección debe ser texto.";
  }

  const normalized = title.trim();

  if (normalized.length === 0) {
    return "El título de la inspección es obligatorio.";
  }

  if (normalized.length > INSPECTION_LIMITS.title) {
    return `El título no puede superar ${INSPECTION_LIMITS.title} caracteres.`;
  }

  if (CONTROL_CHARS.test(normalized)) {
    return "El título contiene caracteres no permitidos.";
  }

  return null;
}

function idError(id: unknown): string | null {
  if (typeof id !== "string") {
    return "El id de la inspección debe ser texto.";
  }

  if (id.length === 0) {
    return "El id de la inspección es obligatorio.";
  }

  if (id.length > INSPECTION_LIMITS.id) {
    return `El id no puede superar ${INSPECTION_LIMITS.id} caracteres.`;
  }

  if (!ID_PATTERN.test(id)) {
    return "El id solo puede contener letras, números, guion y guion bajo.";
  }

  return null;
}

function locationError(location: unknown): string | null {
  if (typeof location !== "string") {
    return "La ubicación de la inspección debe ser texto.";
  }

  const normalized = location.trim();

  if (normalized.length > INSPECTION_LIMITS.location) {
    return `La ubicación no puede superar ${INSPECTION_LIMITS.location} caracteres.`;
  }

  if (CONTROL_CHARS.test(normalized)) {
    return "La ubicación contiene caracteres no permitidos.";
  }

  return null;
}

/** Compatibilidad con el validador anterior: null = válido, texto = error. */
export function validateInspectionTitle(title: unknown): string | null {
  return titleError(title);
}

/**
 * Valida una inspección desconocida. Rechaza: no-objetos, arreglos, campos
 * no permitidos (incluido `__proto__`), tipos incorrectos, longitudes
 * excesivas y caracteres de control.
 */
export function parseInspectionInput(
  input: unknown,
): ParseResult<InspectionInput> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, errors: ["La inspección debe ser un objeto."] };
  }

  const raw = input as Record<string, unknown>;
  const errors: string[] = [];

  for (const key of Object.keys(raw)) {
    if (!ALLOWED_KEYS.has(key)) {
      errors.push(`Campo no permitido: ${key}.`);
    }
  }

  const checks: Array<string | null> = [
    idError(raw.id),
    titleError(raw.title),
    locationError(raw.location),
  ];

  for (const error of checks) {
    if (error) errors.push(error);
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      id: raw.id as string,
      title: (raw.title as string).trim(),
      location: (raw.location as string).trim(),
    },
  };
}
