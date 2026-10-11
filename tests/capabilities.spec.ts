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


// =====================================================================
// Semana 6 - casos adicionales: errores, notificaciones y flujo continuo
// =====================================================================
import { SyncQueue } from "../src/lib/sync/queue.ts";
import {
  requestNotificationPermission,
  showInspectionNotification,
} from "../src/lib/notifications/client.ts";
import { createMemoryStorage, sampleInspection } from "./sync-test-helpers.mjs";

async function withNavigator<T>(fakeNavigator: unknown, run: () => Promise<T>): Promise<T> {
  const original = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: fakeNavigator });
  try {
    return await run();
  } finally {
    if (original) Object.defineProperty(globalThis, "navigator", original);
    else delete (globalThis as { navigator?: unknown }).navigator;
  }
}

function fakeNotificationEnv(permission: NotificationPermission, afterRequest: NotificationPermission = "granted") {
  let current = permission;
  const state = { requests: 0, shown: [] as string[] };
  const api = class {
    static get permission() { return current; }
    static async requestPermission() { state.requests += 1; current = afterRequest; return current; }
    constructor(title: string) { state.shown.push(title); }
  };
  return { environment: { getApi: () => api }, state };
}

test("camara: con permiso concedido devuelve el stream recibido", async () => {
  const fakeStream = { getTracks: () => [] } as unknown as MediaStream;
  const result = await withNavigator(
    { mediaDevices: { getUserMedia: async () => fakeStream } },
    () => requestCamera(),
  );
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.stream, fakeStream);
});

test("camara: SecurityError tambien se trata como permission-denied", async () => {
  const result = await withNavigator(
    { mediaDevices: { getUserMedia: async () => { throw new DOMException("Contexto inseguro", "SecurityError"); } } },
    () => requestCamera(),
  );
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "permission-denied");
});

test("camara: un fallo de hardware devuelve reason error y conserva el error original", async () => {
  const hardwareError = new DOMException("Sin camara", "NotFoundError");
  const result = await withNavigator(
    { mediaDevices: { getUserMedia: async () => { throw hardwareError; } } },
    () => requestCamera(),
  );
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.reason, "error");
    assert.equal(result.error, hardwareError);
  }
});

test("camara: solo pide acceso al invocar requestCamera, una vez por llamada", async () => {
  let calls = 0;
  const fakeNavigator = {
    mediaDevices: { getUserMedia: async () => { calls += 1; return { getTracks: () => [] }; } },
  };
  await withNavigator(fakeNavigator, async () => {
    assert.equal(calls, 0);
    await requestCamera();
    assert.equal(calls, 1);
  });
});

test("geolocalizacion: posicion no disponible (code 2) y timeout (code 3) devuelven reason error", async () => {
  for (const code of [2, 3]) {
    const result = await withNavigator(
      {
        geolocation: {
          getCurrentPosition: (_success: PositionCallback, error: PositionErrorCallback) => {
            error({ code, message: "sintetico" } as GeolocationPositionError);
          },
        },
      },
      () => requestGeolocation(),
    );
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.reason, "error");
      assert.equal(result.error?.code, code);
    }
  }
});

test("geolocalizacion: solo consulta la posicion al invocar requestGeolocation", async () => {
  let calls = 0;
  const fakeNavigator = {
    geolocation: {
      getCurrentPosition: (success: PositionCallback) => {
        calls += 1;
        success({ coords: { latitude: 0, longitude: 0, accuracy: 1 }, timestamp: 0 } as GeolocationPosition);
      },
    },
  };
  await withNavigator(fakeNavigator, async () => {
    assert.equal(calls, 0);
    await requestGeolocation();
    assert.equal(calls, 1);
  });
});

test("notificaciones: con permiso concedido muestra el aviso del evento", () => {
  const env = fakeNotificationEnv("granted");
  const result = showInspectionNotification("inspection-synced", env.environment);
  assert.equal(result.status, "shown");
  assert.equal(env.state.shown.length, 1);
  assert.equal(env.state.requests, 0);
});

test("notificaciones: con permiso denegado no muestra aviso y devuelve fallback", () => {
  const env = fakeNotificationEnv("denied");
  const result = showInspectionNotification("inspection-synced", env.environment);
  assert.equal(result.status, "denied");
  assert.equal(env.state.shown.length, 0);
});

test("notificaciones: sin la API devuelve unsupported sin lanzar", () => {
  const result = showInspectionNotification("inspection-synced", { getApi: () => undefined });
  assert.equal(result.status, "unsupported");
});

test("notificaciones: el permiso solo se pide desde requestNotificationPermission", async () => {
  const env = fakeNotificationEnv("default");
  const eventResult = showInspectionNotification("inspection-assigned", env.environment);
  assert.equal(eventResult.status, "permission-required");
  assert.equal(env.state.requests, 0);

  const requestResult = await requestNotificationPermission(env.environment);
  assert.equal(requestResult.status, "shown");
  assert.equal(env.state.requests, 1);
});

test("flujo principal: la inspeccion se encola aunque camara, geolocalizacion y notificaciones no esten disponibles", async () => {
  const storage = createMemoryStorage();
  const queue = new SyncQueue(storage);

  const evidence = await withNavigator({}, async () => ({
    camera: await requestCamera(),
    location: await requestGeolocation(),
  }));
  const notice = showInspectionNotification("inspection-synced", { getApi: () => undefined });

  assert.equal(evidence.camera.ok, false);
  assert.equal(evidence.location.ok, false);
  assert.equal(notice.status, "unsupported");

  // El fallback no bloquea el guardado: la operacion se encola igual.
  await queue.enqueue({
    operationId: "op-cap-1",
    inspectionId: "inspection-sintetica-1",
    type: "create",
    payload: sampleInspection(),
  });
  const pending = await queue.getPending();
  assert.equal(pending.length, 1);
});