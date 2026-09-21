/**
 * Issue #14 - Pruebas del funcionamiento offline de la PWA.
 *
 * Cubren perdida de conectividad, fallback offline y regresiones relevantes.
 * Ejecutan el public/sw.js real en un sandbox: deterministas y con datos
 * 100 % sinteticos (sin red real ni servicios privados).
 *
 * Ejecutar: node --experimental-strip-types tests/offline.spec.ts
 */
import test from "node:test";
import assert from "node:assert/strict";

const helperPath = "./helpers/sw-harness.mjs";
const { loadServiceWorker, ORIGIN } = await import(helperPath);

const abs = (path: string) => new URL(path, ORIGIN).href;

/** SW instalado y activo; luego se corta la conexion. */
async function arrancarSinConexion() {
  const sw = loadServiceWorker();
  await sw.install();
  await sw.activate();
  sw.network.state.online = false;
  return sw;
}

test("sin conexion, navegar a la raiz sirve la pagina precacheada", async () => {
  const sw = await arrancarSinConexion();

  const r = await sw.fetchEvent("/", { navigate: true });

  assert.equal(r.error, undefined);
  assert.equal(r.response.status, 200);
  assert.equal(await r.response.text(), `sintetico:${abs("/")}`);
});

// Fallback offline: una ruta nunca visitada cae a la pagina inicial precacheada.
test("sin conexion, una ruta nunca visitada cae a la pagina inicial precacheada", async () => {
  const sw = await arrancarSinConexion();

  const r = await sw.fetchEvent("/inspecciones/ruta-nunca-visitada", { navigate: true });

  assert.equal(r.error, undefined);
  assert.equal(r.response.status, 200);
  assert.equal(await r.response.text(), `sintetico:${abs("/")}`);
});

// Ultimo recurso: sin red y sin nada en cache (SW recien instalado sin precache).
test("sin conexion y sin cache, la navegacion devuelve la pagina 'Sin conexion' con 503", async () => {
  const sw = loadServiceWorker(); // sin install: cache vacia
  sw.network.state.online = false;

  const r = await sw.fetchEvent("/inspecciones", { navigate: true });

  assert.equal(r.error, undefined);
  assert.equal(r.response.status, 503);
  assert.match(await r.response.text(), /Sin conexi/);
});

test("network first: con conexion usa la red y luego la ultima copia al perderla", async () => {
  const sw = loadServiceWorker();
  await sw.install();
  await sw.activate();
  sw.network.state.routes.set(
    abs("/inspecciones"),
    () => new Response("contenido-red-v1", { status: 200 }),
  );

  const conRed = await sw.fetchEvent("/inspecciones", { navigate: true });
  assert.equal(await conRed.response.text(), "contenido-red-v1");

  sw.network.state.online = false;
  const sinRed = await sw.fetchEvent("/inspecciones", { navigate: true });

  assert.equal(sinRed.error, undefined);
  assert.equal(await sinRed.response.text(), "contenido-red-v1");
});

test("sin conexion, los iconos precacheados siguen disponibles (cache first)", async () => {
  const sw = await arrancarSinConexion();

  const r = await sw.fetchEvent("/icons/icon-192.png", { destination: "image" });

  assert.equal(r.error, undefined);
  assert.equal(r.response.status, 200);
  assert.equal(await r.response.text(), `sintetico:${abs("/icons/icon-192.png")}`);
});

test("sin conexion, el manifest se sirve desde cache", async () => {
  const sw = await arrancarSinConexion();

  const r = await sw.fetchEvent("/manifest.webmanifest", { destination: "" });

  assert.equal(r.error, undefined);
  assert.equal(r.response.status, 200);
});

test("network first: /api/inspections queda disponible offline tras una consulta con conexion", async () => {
  const sw = loadServiceWorker();
  await sw.install();
  await sw.activate();
  sw.network.state.routes.set(
    abs("/api/inspections"),
    () => new Response('[{"id":"insp-sintetica-1"}]', { status: 200 }),
  );

  await sw.fetchEvent("/api/inspections", { destination: "" });
  sw.network.state.online = false;
  const sinRed = await sw.fetchEvent("/api/inspections", { destination: "" });

  assert.equal(sinRed.error, undefined);
  assert.equal(await sinRed.response.text(), '[{"id":"insp-sintetica-1"}]');
});

// Regresion relevante: si se cacheara un 500, la app mostraria un error "pegado"
// incluso despues de que el servidor se recupere.
test("regresion: una respuesta 500 no se guarda ni se sirve despues sin conexion", async () => {
  const sw = loadServiceWorker();
  await sw.install();
  await sw.activate();
  sw.network.state.routes.set(
    abs("/inspecciones/falla"),
    () => new Response("error-500-sintetico", { status: 500 }),
  );

  const conRed = await sw.fetchEvent("/inspecciones/falla", { navigate: true });
  assert.equal(conRed.response.status, 500, "con red se entrega tal cual lo que responde el servidor");

  sw.network.state.online = false;
  const sinRed = await sw.fetchEvent("/inspecciones/falla", { navigate: true });

  assert.equal(sinRed.response.status, 200);
  assert.notEqual(await sinRed.response.text(), "error-500-sintetico");
});

// Limite documentado: los recursos estaticos NO precacheados no tienen fallback.
test("limite: un recurso estatico no cacheado falla sin conexion (sin fallback)", async () => {
  const sw = await arrancarSinConexion();

  const r = await sw.fetchEvent("/assets/nunca-cacheado.js", { destination: "script" });

  assert.ok(r.error, "la peticion falla como error de red");
});

test("limite: una peticion POST sin conexion falla (aun no hay cola offline)", async () => {
  const sw = await arrancarSinConexion();

  const r = await sw.fetchEvent("/api/inspections", { method: "POST" });

  assert.ok(r.error);
});