export type CameraResult =
  | {
      ok: true;
      stream: MediaStream;
    }
  | {
      ok: false;
      reason: "unsupported" | "permission-denied" | "error";
      error?: unknown;
    };

/**
 * Pide acceso a la cámara. Llamar solo desde una acción directa del usuario.
 * Nunca lanza: devuelve un resultado para que el flujo principal continúe.
 * Solo pide video; no solicita micrófono.
 */
export async function requestCamera(): Promise<CameraResult> {
  // `typeof navigator` evita un ReferenceError fuera del navegador (render en servidor).
  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    return {
      ok: false,
      reason: "unsupported",
    };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });

    return {
      ok: true,
      stream,
    };
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.name === "NotAllowedError" || error.name === "SecurityError")
    ) {
      return {
        ok: false,
        reason: "permission-denied",
        error,
      };
    }

    return {
      ok: false,
      reason: "error",
      error,
    };
  }
}

/** Libera la cámara: detiene todas las pistas del stream. */
export function stopCamera(stream: MediaStream): void {
  stream.getTracks().forEach((track) => track.stop());
}
