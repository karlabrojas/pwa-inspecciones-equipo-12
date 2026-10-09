import test from "node:test";
import assert from "node:assert/strict";

import { requestCamera, stopCamera } from "../src/lib/device/camera.ts";

import { requestGeolocation } from "../src/lib/device/geolocation.ts";

// --- Cámara ---

test("camara: si getUserMedia no esta disponible devuelve unsupported", async () => {
  const originalNavigator = globalThis.navigator;

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {},
  });

  const result = await requestCamera();

  assert.deepEqual(result, {
    ok: false,
    reason: "unsupported",
  });

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: originalNavigator,
  });
});

test("camara: solicita video sin solicitar audio", async () => {
  const originalNavigator = globalThis.navigator;

  let receivedConstraints: MediaStreamConstraints | undefined;

  const fakeStream = {
    getTracks: () => [],
  } as unknown as MediaStream;

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      mediaDevices: {
        getUserMedia: async (constraints: MediaStreamConstraints) => {
          receivedConstraints = constraints;
          return fakeStream;
        },
      },
    },
  });

  const result = await requestCamera();

  assert.equal(result.ok, true);
  assert.equal(receivedConstraints?.video, true);
  assert.equal(receivedConstraints?.audio, false);

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: originalNavigator,
  });
});

test("camara: un permiso denegado devuelve permission-denied", async () => {
  const originalNavigator = globalThis.navigator;

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      mediaDevices: {
        getUserMedia: async () => {
          throw new DOMException("Permiso denegado", "NotAllowedError");
        },
      },
    },
  });

  const result = await requestCamera();

  assert.equal(result.ok, false);

  if (!result.ok) {
    assert.equal(result.reason, "permission-denied");
  }

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: originalNavigator,
  });
});

test("camara: stopCamera detiene todos los tracks", () => {
  let stoppedTracks = 0;

  const stream = {
    getTracks: () => [
      {
        stop: () => {
          stoppedTracks += 1;
        },
      },
      {
        stop: () => {
          stoppedTracks += 1;
        },
      },
    ],
  } as unknown as MediaStream;

  stopCamera(stream);

  assert.equal(stoppedTracks, 2);
});

// --- Geolocalización ---

test("geolocalizacion: si la API no esta disponible devuelve unsupported", async () => {
  const originalNavigator = globalThis.navigator;

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {},
  });

  const result = await requestGeolocation();

  assert.deepEqual(result, {
    ok: false,
    reason: "unsupported",
  });

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: originalNavigator,
  });
});

test("geolocalizacion: obtiene la posicion y usa configuracion de bajo consumo", async () => {
  const originalNavigator = globalThis.navigator;

  let receivedOptions: PositionOptions | undefined;

  const fakePosition = {
    coords: {
      latitude: 19.4326,
      longitude: -99.1332,
      accuracy: 100,
    },
    timestamp: Date.now(),
  } as GeolocationPosition;

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      geolocation: {
        getCurrentPosition: (
          success: PositionCallback,
          _error: PositionErrorCallback,
          options?: PositionOptions,
        ) => {
          receivedOptions = options;
          success(fakePosition);
        },
      },
    },
  });

  const result = await requestGeolocation();

  assert.equal(result.ok, true);

  if (result.ok) {
    assert.equal(result.position, fakePosition);
  }

  assert.equal(receivedOptions?.enableHighAccuracy, false);
  assert.equal(receivedOptions?.maximumAge, 300_000);
  assert.equal(receivedOptions?.timeout, 10_000);

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: originalNavigator,
  });
});

test("geolocalizacion: permiso denegado devuelve permission-denied", async () => {
  const originalNavigator = globalThis.navigator;

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      geolocation: {
        getCurrentPosition: (
          _success: PositionCallback,
          error: PositionErrorCallback,
        ) => {
          error({
            code: 1,
            message: "Permiso denegado",
          } as GeolocationPositionError);
        },
      },
    },
  });

  const result = await requestGeolocation();

  assert.equal(result.ok, false);

  if (!result.ok) {
    assert.equal(result.reason, "permission-denied");
  }

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: originalNavigator,
  });
});
