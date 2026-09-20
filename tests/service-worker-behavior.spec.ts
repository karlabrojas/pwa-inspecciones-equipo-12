/**
 * Issue #14 - Pruebas de COMPORTAMIENTO del Service Worker (public/sw.js).
 *
 * Complementan tests/service-worker.spec.ts (que revisa la estructura del
 * codigo) ejecutando el SW real en un sandbox con caches/fetch simulados.
 * Deterministas: sin red real, sin servicios privados, solo datos sinteticos.
 *
 * Ejecutar: node --experimental-strip-types tests/service-worker-behavior.spec.ts
 */
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";

// El helper es .mjs; se importa dinamicamente para no exigir tipos a tsc/next build.
const helperPath = "./helpers/sw-harness.mjs";
const { loadServiceWorker, readServiceWorkerSource, ORIGIN, SW_FILE } = await import(helperPath);

const STATIC_CACHE = "inspecciones-static-v1";
const RUNTIME_CACHE = "inspecciones-runtime-v1";
const abs = (path: string) => new URL(path, ORIGIN).href;

test("existe public/sw.js y registra install, activate y fetch", () => {
  assert.equal(existsSync(SW_FILE), true);
  const sw = loadServiceWorker();
  assert.ok(sw.listeners.install?.length > 0);
  assert.ok(sw.listeners.activate?.length > 0);
  assert.ok(sw.listeners.fetch?.length > 0);
});

test("install: precachea exactamente los recursos base en la cache estatica", async () => {
  const sw = loadServiceWorker();
  await sw.install();

  const guardadas = [...sw.caches.stores.get(STATIC_CACHE).keys()].sort();
  const esperadas = [
    "/",
    "/manifest.webmanifest",
    "/icons/icon-192.png",
    "/icons/icon-512.png",
  ]
    .map(abs)
    .sort();

  assert.deepEqual(guardadas, esperadas);
});

// Actualizacion segura: al activar una version nueva se limpian las caches viejas
// de ESTA app, sin tocar las vigentes ni las de otras apps del mismo origen.
test("activate: borra caches viejas de inspecciones, conserva las vigentes y las ajenas", async () => {
  const sw = loadServiceWorker();
  for (const nombre of [
    "inspecciones-static-v0",
    "inspecciones-runtime-v0",
    RUNTIME_CACHE,
    "otra-app-cache",
  ]) {
    const cache = await sw.caches.api.open(nombre);
    await cache.put("/x-sintetico", new Response("x"));
  }

  await sw.install();
  await sw.activate();

  const nombres = (await sw.caches.api.keys()).sort();
  assert.deepEqual(nombres, [STATIC_CACHE, RUNTIME_CACHE, "otra-app-cache"].sort());
  assert.equal(sw.flags.clientsClaim, 1, "debe tomar control de los clientes");
});

test("fetch: una peticion POST va directo a la red y no se cachea", async () => {
  const sw = loadServiceWorker();
  await sw.install();
  const antes = await sw.cachedUrls();

  const r = await sw.fetchEvent("/api/inspections", { method: "POST" });

  assert.ok(r.response, "responde con lo que devuelve la red");
  assert.ok(sw.network.state.calls.includes(abs("/api/inspections")));
  assert.deepEqual(await sw.cachedUrls(), antes);
});

test("fetch: una peticion a otro origen va directo a la red y no se cachea", async () => {
  const sw = loadServiceWorker();
  await sw.install();
  const antes = await sw.cachedUrls();

  const r = await sw.fetchEvent("https://tercero.test/lib.js");

  assert.ok(r.response);
  assert.ok(sw.network.state.calls.includes("https://tercero.test/lib.js"));
  assert.deepEqual(await sw.cachedUrls(), antes);
});

// Regresion relevante: Next.js agrega ?v=... a los chunks en desarrollo; sin
// normalizar la clave se guardaria una copia por cada valor y fallaria offline.
test("cache first: /_next/static ignora el parametro ?v= al buscar en cache", async () => {
  const sw = loadServiceWorker();
  await sw.install();
  await sw.activate();

  const conRed = await sw.fetchEvent("/_next/static/chunks/main-app.js?v=123");
  const cuerpo = await conRed.response.text();

  sw.network.state.online = false;
  const sinRed = await sw.fetchEvent("/_next/static/chunks/main-app.js?v=456");

  assert.equal(sinRed.error, undefined);
  assert.equal(await sinRed.response.text(), cuerpo);
});

test("stale-while-revalidate: el manifest responde desde cache y revalida en segundo plano", async () => {
  const sw = loadServiceWorker();
  await sw.install();
  await sw.activate();
  const manifest = abs("/manifest.webmanifest");

  sw.network.state.routes.set(manifest, () => new Response("manifest-nuevo", { status: 200 }));

  const r = await sw.fetchEvent("/manifest.webmanifest", { destination: "" });

  // Responde de inmediato con la copia guardada (no espera a la red)...
  assert.equal(await r.response.text(), `sintetico:${manifest}`);
  // ...y en segundo plano consulta la red y guarda la version nueva en la cache de runtime.
  assert.ok(sw.network.state.calls.includes(manifest));
  const enRuntime = await sw.caches.stores.get(RUNTIME_CACHE).get(manifest).text();
  assert.equal(enRuntime, "manifest-nuevo");
});

test("seguridad: public/sw.js no contiene secretos ni tokens", () => {
  const patronesSensibles =
    /(api[_-]?key|secret|password|bearer\s+[A-Za-z0-9._-]{10,}|ghp_[A-Za-z0-9]{20,})/i;
  assert.doesNotMatch(readServiceWorkerSource(), patronesSensibles);
});