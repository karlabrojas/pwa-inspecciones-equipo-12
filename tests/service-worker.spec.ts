import { readFile } from "node:fs/promises";

import { resolve } from "node:path";

import assert from "node:assert/strict";

const root = resolve(import.meta.dirname, "..");

const serviceWorker = await readFile(resolve(root, "public/sw.js"), "utf8");

const registration = await readFile(
  resolve(root, "src/lib/pwa/register-service-worker.ts"),
  "utf8",
);

// Ciclo de vida del Service Worker

assert.match(serviceWorker, /addEventListener\(["']install["']/);

assert.match(serviceWorker, /addEventListener\(["']activate["']/);

assert.match(serviceWorker, /addEventListener\(["']fetch["']/);

// Versionado de caché

assert.match(serviceWorker, /CACHE_VERSION/);

assert.match(serviceWorker, /inspecciones-static-\$\{CACHE_VERSION\}/);

assert.match(serviceWorker, /inspecciones-runtime-\$\{CACHE_VERSION\}/);

// Recursos precargados

assert.match(serviceWorker, /PRECACHE_URLS/);

assert.match(serviceWorker, /\/manifest\.webmanifest/);

assert.match(serviceWorker, /\/icons\/icon-192\.png/);

assert.match(serviceWorker, /\/icons\/icon-512\.png/);

// Estrategias de caché

assert.match(serviceWorker, /async function cacheFirst/);

assert.match(serviceWorker, /async function staleWhileRevalidate/);

assert.match(serviceWorker, /async function networkFirst/);

assert.match(serviceWorker, /async function networkOnly/);

// Datos de inspecciones

assert.match(serviceWorker, /\/api\/inspections/);

// Eliminación de cachés antiguas

assert.match(serviceWorker, /caches\.delete/);

// Control de clientes después de activar el SW

assert.match(serviceWorker, /self\.clients\.claim\(\)/);

// Recursos estáticos de Next.js

assert.match(serviceWorker, /\/_next\/static\//);

// Normalización de parámetros ?v=...

assert.match(serviceWorker, /function getCacheKey/);

assert.match(
  serviceWorker,
  /url\.pathname\.startsWith\(["']\/_next\/static\/["']\)/,
);

assert.match(serviceWorker, /url\.search\s*=\s*["']["']/);

// Registro del Service Worker

assert.match(
  registration,
  /navigator\.serviceWorker\s*\.register\(["']\/sw\.js["']\)/,
);

// Manejo de errores del registro

assert.match(registration, /console\.error/);

console.log("service-worker.spec.ts: PASS");
