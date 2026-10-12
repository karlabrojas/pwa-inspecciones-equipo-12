import test from "node:test";
import assert from "node:assert/strict";

import { requestCamera, stopCamera } from "../src/lib/device/camera.ts";
import { requestGeolocation } from "../src/lib/device/geolocation.ts";
import {
  requestNotificationPermission,
  showInspectionNotification,
} from "../src/lib/notifications/client.ts";
import { SyncQueue } from "../src/lib/sync/queue.ts";
import { createMemoryStorage, sampleInspection } from "./sync-test-helpers.mjs";

// ---------------------------------------------------------------------------
// Utilidades de prueba (todo sintético, sin red ni permisos reales)
// ---------------------------------------------------------------------------

/** Reemplaza `navigator` durante `run` y SIEMPRE lo restaura, aunque falle un assert. */
async function withNavigator<T>(
  fakeNavigator: unknown,
  run: () => Promise<T>,
): Promise<T> {
  const original = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: fakeNavigator,
  });
  try {
    return await run();
  } finally {
    if (original) Object.defineProperty(globalThis, "navigator", original);
    else delete (globalThis as { navigator?: unknown }).navigator;
  }
}

const syntheticPosition = {
  coords: { latitude: 0, longitude: 0, accuracy: 100 },
  timestamp: 0,
} as GeolocationPosition;

function fakeNotificationEnv(
  permission: NotificationPermission,
  afterRequest: NotificationPermission = "granted",
) {
  let current = permission;
  const state = {
    requests: 0,
    shown: [] as { title: string; body?: string }[],
  };
  const api = class {
    static get permission() {
      return current;
    }
    static async requestPermission() {
      state.requests += 1;
      current = afterRequest;
      return current;
    }
    constructor(title: string, options?: NotificationOptions) {
      state.shown.push({ title, body: options?.body });
    }
  };
  return { environment: { getApi: () => api }, state };
}

// ---------------------------------------------------------------------------
// Cámara
// ---------------------------------------------------------------------------

test("camara: si getUserMedia no esta disponible devuelve unsupported", async () => {
  const result = await withNavigator({}, () => requestCamera());
  assert.deepEqual(result, { ok: false, reason: "unsupported" });
});

test("camara: sin objeto navigator (render en servidor) devuelve unsupported sin lanzar", async () => {
  const result = await withNavigator(undefined, () => requestCamera());
  assert.deepEqual(result, { ok: false, reason: "unsupported" });
});

test("camara: solicita video sin solicitar audio", async () => {
  let receivedConstraints: MediaStreamConstraints | undefined;
  const fakeStream = { getTracks: () => [] } as unknown as MediaStream;

  const result = await withNavigator(
    {
      mediaDevices: {
        getUserMedia: async (constraints: MediaStreamConstraints) => {
          receivedConstraints = constraints;
          return fakeStream;
        },
      },
    },
    () => requestCamera(),
  );

  assert.equal(result.ok, true);
  assert.equal(receivedConstraints?.video, true);
  assert.equal(receivedConstraints?.audio, false);
});

test("camara: con permiso concedido devuelve el stream recibido", async () => {
  const fakeStream = { getTracks: () => [] } as unknown as MediaStream;
  const result = await withNavigator(
    { mediaDevices: { getUserMedia: async () => fakeStream } },
    () => requestCamera(),
  );
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.stream, fakeStream);
});

test("camara: un permiso denegado devuelve permission-denied", async () => {
  const result = await withNavigator(
    {
      mediaDevices: {
        getUserMedia: async () => {
          throw new DOMException("Permiso denegado", "NotAllowedError");
        },
      },
    },
    () => requestCamera(),
  );
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "permission-denied");
});

test("camara: SecurityError tambien se trata como permission-denied", async () => {
  const result = await withNavigator(
    {
      mediaDevices: {
        getUserMedia: async () => {
          throw new DOMException("Contexto inseguro", "SecurityError");
        },
      },
    },
    () => requestCamera(),
  );
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "permission-denied");
});

test("camara: un fallo de hardware devuelve reason error y conserva el error original", async () => {
  const hardwareError = new DOMException("Sin camara", "NotFoundError");
  const result = await withNavigator(
    {
      mediaDevices: {
        getUserMedia: async () => {
          throw hardwareError;
        },
      },
    },
    () => requestCamera(),
  );
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.reason, "error");
    assert.equal(result.error, hardwareError);
  }
});

test("camara: stopCamera detiene todos los tracks", () => {
  let stoppedTracks = 0;
  const track = {
    stop: () => {
      stoppedTracks += 1;
    },
  };
  const stream = { getTracks: () => [track, track] } as unknown as MediaStream;

  stopCamera(stream);

  assert.equal(stoppedTracks, 2);
});

test("camara: cargar el modulo no solicita acceso a la camara", async () => {
  let calls = 0;
  await withNavigator(
    {
      mediaDevices: {
        getUserMedia: async () => {
          calls += 1;
          return { getTracks: () => [] };
        },
      },
    },
    async () => {
      // El query string fuerza una carga nueva del modulo bajo este navigator falso.
      const url = new URL(
        "../src/lib/device/camera.ts?carga-nueva",
        import.meta.url,
      ).href;
      await import(url);
      assert.equal(calls, 0);
    },
  );
});

// ---------------------------------------------------------------------------
// Geolocalización
// ---------------------------------------------------------------------------

test("geolocalizacion: si la API no esta disponible devuelve unsupported", async () => {
  const result = await withNavigator({}, () => requestGeolocation());
  assert.deepEqual(result, { ok: false, reason: "unsupported" });
});

test("geolocalizacion: sin objeto navigator (render en servidor) devuelve unsupported sin lanzar", async () => {
  const result = await withNavigator(undefined, () => requestGeolocation());
  assert.deepEqual(result, { ok: false, reason: "unsupported" });
});

test("geolocalizacion: obtiene la posicion y usa configuracion de bajo consumo", async () => {
  let receivedOptions: PositionOptions | undefined;

  const result = await withNavigator(
    {
      geolocation: {
        getCurrentPosition: (
          success: PositionCallback,
          _error: PositionErrorCallback,
          options?: PositionOptions,
        ) => {
          receivedOptions = options;
          success(syntheticPosition);
        },
      },
    },
    () => requestGeolocation(),
  );

  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.position, syntheticPosition);
  assert.equal(receivedOptions?.enableHighAccuracy, false);
  assert.equal(receivedOptions?.maximumAge, 300_000);
  assert.equal(receivedOptions?.timeout, 10_000);
});

test("geolocalizacion: permiso denegado devuelve permission-denied", async () => {
  const result = await withNavigator(
    {
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
    () => requestGeolocation(),
  );
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "permission-denied");
});

test("geolocalizacion: posicion no disponible (code 2) y timeout (code 3) devuelven reason error", async () => {
  for (const code of [2, 3]) {
    const result = await withNavigator(
      {
        geolocation: {
          getCurrentPosition: (
            _success: PositionCallback,
            error: PositionErrorCallback,
          ) => {
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

test("geolocalizacion: si la API lanza de forma sincrona devuelve reason error sin lanzar", async () => {
  const result = await withNavigator(
    {
      geolocation: {
        getCurrentPosition: () => {
          throw new Error("bloqueado por politica de permisos");
        },
      },
    },
    () => requestGeolocation(),
  );
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "error");
});

test("geolocalizacion: cargar el modulo no consulta la ubicacion", async () => {
  let calls = 0;
  await withNavigator(
    {
      geolocation: {
        getCurrentPosition: () => {
          calls += 1;
        },
      },
    },
    async () => {
      const url = new URL(
        "../src/lib/device/geolocation.ts?carga-nueva",
        import.meta.url,
      ).href;
      await import(url);
      assert.equal(calls, 0);
    },
  );
});

// ---------------------------------------------------------------------------
// Notificaciones
// ---------------------------------------------------------------------------

test("notificaciones: con permiso concedido muestra el aviso del evento", () => {
  const env = fakeNotificationEnv("granted");
  const result = showInspectionNotification(
    "inspection-synced",
    env.environment,
  );
  assert.equal(result.status, "shown");
  assert.equal(env.state.shown.length, 1);
  assert.equal(env.state.requests, 0);
});

test("notificaciones: con permiso denegado no muestra aviso y devuelve fallback", () => {
  const env = fakeNotificationEnv("denied");
  const result = showInspectionNotification(
    "inspection-synced",
    env.environment,
  );
  assert.equal(result.status, "denied");
  assert.equal(env.state.shown.length, 0);
});

test("notificaciones: sin la API devuelve unsupported sin lanzar", () => {
  const result = showInspectionNotification("inspection-synced", {
    getApi: () => undefined,
  });
  assert.equal(result.status, "unsupported");
});

test("notificaciones: si el constructor lanza devuelve status error sin propagar la excepcion", () => {
  const throwingApi = class {
    static get permission() {
      return "granted" as NotificationPermission;
    }
    static async requestPermission() {
      return "granted" as NotificationPermission;
    }
    constructor() {
      throw new TypeError("Illegal constructor");
    }
  };
  const result = showInspectionNotification("inspection-assigned", {
    getApi: () => throwingApi,
  });
  assert.equal(result.status, "error");
});

test("notificaciones: el permiso solo se pide desde requestNotificationPermission", async () => {
  const env = fakeNotificationEnv("default");
  const eventResult = showInspectionNotification(
    "inspection-assigned",
    env.environment,
  );
  assert.equal(eventResult.status, "permission-required");
  assert.equal(env.state.requests, 0);

  const requestResult = await requestNotificationPermission(env.environment);
  assert.equal(requestResult.status, "shown");
  assert.equal(env.state.requests, 1);
});

test("notificaciones: si el usuario rechaza el permiso el resultado es denied y no se muestra nada", async () => {
  const env = fakeNotificationEnv("default", "denied");
  const result = await requestNotificationPermission(env.environment);
  assert.equal(result.status, "denied");
  assert.equal(env.state.shown.length, 0);
});

test("notificaciones: los avisos usan texto generico, sin identificadores ni datos personales", () => {
  for (const event of ["inspection-synced", "inspection-assigned"] as const) {
    const env = fakeNotificationEnv("granted");
    showInspectionNotification(event, env.environment);
    const [shown] = env.state.shown;
    assert.ok(shown, `se esperaba un aviso para ${event}`);
    const text = `${shown.title} ${shown.body ?? ""}`;
    assert.doesNotMatch(
      text,
      /[0-9@]/,
      `el aviso ${event} no debe incluir digitos ni correos`,
    );
  }
});

// ---------------------------------------------------------------------------
// Flujo principal
// ---------------------------------------------------------------------------

test("flujo principal: la inspeccion se encola aunque camara, geolocalizacion y notificaciones no esten disponibles", async () => {
  const queue = new SyncQueue(createMemoryStorage());

  const evidence = await withNavigator({}, async () => ({
    camera: await requestCamera(),
    location: await requestGeolocation(),
  }));
  const notice = showInspectionNotification("inspection-synced", {
    getApi: () => undefined,
  });

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
  assert.equal(pending[0].operationId, "op-cap-1");
});
