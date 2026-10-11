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

export async function requestCamera(): Promise<CameraResult> {
  if (!navigator.mediaDevices?.getUserMedia) {
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

export function stopCamera(stream: MediaStream): void {
  stream.getTracks().forEach((track) => track.stop());
}
