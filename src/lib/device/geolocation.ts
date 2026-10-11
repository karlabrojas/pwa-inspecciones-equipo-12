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

export function requestGeolocation(): Promise<GeolocationResult> {
  if (!navigator.geolocation) {
    return Promise.resolve({
      ok: false,
      reason: "unsupported",
    });
  }

  return new Promise((resolve) => {
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
  });
}
