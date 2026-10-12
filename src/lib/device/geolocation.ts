export type GeolocationResult =
  | {
      ok: true;
      position: GeolocationPosition;
    }
  | {
      ok: false;
      reason: "unsupported" | "permission-denied" | "error";
      error?: GeolocationPositionError;
    };

/**
 * Pide la ubicación una sola vez, con baja precisión. Llamar solo desde una
 * acción directa del usuario. Nunca lanza ni rechaza la promesa.
 *
 * Nota: el `timeout` solo corre después de que el usuario responde al diálogo
 * de permiso; si lo ignora, la promesa queda pendiente (ver docs/capabilities.md).
 */
export function requestGeolocation(): Promise<GeolocationResult> {
  // `typeof navigator` evita un ReferenceError fuera del navegador (render en servidor).
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve({
      ok: false,
      reason: "unsupported",
    });
  }

  return new Promise((resolve) => {
    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            ok: true,
            position,
          });
        },
        (error) => {
          if (error.code === 1) {
            resolve({
              ok: false,
              reason: "permission-denied",
              error,
            });
            return;
          }

          resolve({
            ok: false,
            reason: "error",
            error,
          });
        },
        {
          enableHighAccuracy: false,
          maximumAge: 300_000,
          timeout: 10_000,
        },
      );
    } catch {
      // Algunos navegadores pueden lanzar de forma síncrona (p. ej. política de permisos).
      resolve({
        ok: false,
        reason: "error",
      });
    }
  });
}
