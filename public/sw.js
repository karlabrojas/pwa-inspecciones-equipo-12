const CACHE_VERSION = "v1";

const STATIC_CACHE = `inspecciones-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `inspecciones-runtime-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

/*
 * Recursos estáticos que pueden utilizar Cache First.
 */
const STATIC_DESTINATIONS = new Set([
  "style",
  "script",
  "font",
  "image",
]);

/*
 * Recursos que pueden actualizarse en segundo plano.
 */
const REVALIDATE_PATHS = [
  "/manifest.webmanifest",
];

/*
 * Instalación
 
 * Se crea la caché estática y se almacenan, los recursos necesarios para iniciar la aplicación.
 */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch((error) => {
        console.error(
          "[PWA] Error durante la instalación del Service Worker:",
          error
        );

        throw error;
      })
  );
});

/*
 * Activación
 *
 * Se eliminan cachés antiguas y posteriormente, el Service Worker toma el control de los clientes dentro de su alcance.
 */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                (
                  cacheName.startsWith("inspecciones-static-") ||
                  cacheName.startsWith("inspecciones-runtime-")
                ) &&
                cacheName !== STATIC_CACHE &&
                cacheName !== RUNTIME_CACHE
            )
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
      .catch((error) => {
        console.error(
          "[PWA] Error durante la activación del Service Worker:",
          error
        );
      })
  );
});

/*
 * Crea una clave de caché normalizada para recursos estáticos generados por Next.js.
 *
 * En desarrollo Next.js puede agregar parámetros como:
 *
 * /_next/static/chunks/main-app.js?v=123
 *
 * /_next/static/chunks/main-app.js?v=456
 *
 * Ambos representan el mismo recurso estático.
 */

function getCacheKey(request) {
  const url = new URL(request.url);

  if (url.pathname.startsWith("/_next/static/")) {
    url.search = "";
  }

  return new Request(url.toString(), {
    method: "GET",
    headers: request.headers,
  });
}

/*
 * ---------------------------------------------------------
 * CACHE FIRST
 * ---------------------------------------------------------
 *
 * Primero busca el recurso en caché.
 * Si no existe, lo obtiene de la red y lo guarda.
 */
async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cacheKey = getCacheKey(request);

  const cachedResponse = await caches.match(cacheKey);

  if (cachedResponse) {
    return cachedResponse;
  }
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {

      await cache.put(cacheKey, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.warn(
      "[PWA] Recurso no disponible en caché ni en red:",
      request.url,
      error
    );
    throw error;
  }
}

/*
 * ---------------------------------------------------------
 * STALE WHILE REVALIDATE
 * ---------------------------------------------------------
 *
 * Devuelve inmediatamente la caché cuando existe
 * y actualiza el recurso en segundo plano.
 */
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);

  const networkResponse = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        const cache = await caches.open(RUNTIME_CACHE);

        await cache.put(request, response.clone());
      }

      return response;
    })
    .catch((error) => {
      console.warn(
        "[PWA] No fue posible actualizar el recurso:",
        error
      );

      return null;
    });

  if (cachedResponse) {
    return cachedResponse;
  }

  const response = await networkResponse;

  if (response) {
    return response;
  }

  throw new Error("Recurso no disponible.");
}

/*
 * ---------------------------------------------------------
 * NETWORK FIRST
 * ---------------------------------------------------------
 *
 * Primero intenta utilizar la red.
 * Si falla, utiliza una copia previamente almacenada.
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);

      await cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.warn(
      "[PWA] La red no está disponible. Buscando recurso en caché:",
      error
    );

    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

/*
 * ---------------------------------------------------------
 * NETWORK ONLY
 * ---------------------------------------------------------
 *
 * La solicitud siempre se realiza mediante la red.
 * No se almacena en la caché.
 */
async function networkOnly(request) {
  return fetch(request);
}

/*
 * Comprueba si la solicitud pertenece al mismo origen.
 */
function isSameOrigin(request) {
  return new URL(request.url).origin === self.location.origin;
}

/*
 * Comprueba si se trata de una navegación.
 */
function isNavigationRequest(request) {
  return request.mode === "navigate";
}

/*
 * Comprueba si la ruta debe utilizar
 * Stale While Revalidate.
 */
function shouldRevalidate(url) {
  return REVALIDATE_PATHS.some((path) =>
    url.pathname.startsWith(path)
  );
}

/*
 * ---------------------------------------------------------
 * FETCH
 * ---------------------------------------------------------
 *
 * Intercepta las solicitudes realizadas por la aplicación.
 */
self.addEventListener("fetch", (event) => {
  const { request } = event;

  /*
   * Solo procesamos solicitudes GET.
   *
   * POST, PUT, PATCH y DELETE utilizan la red directamente.
   */
  if (request.method !== "GET") {
    event.respondWith(networkOnly(request));
    return;
  }

  /*
   * Las solicitudes externas no se almacenan.
   */
  if (!isSameOrigin(request)) {
    event.respondWith(networkOnly(request));
    return;
  }

  const url = new URL(request.url);

  /*
   * -------------------------------------------------------
   * NETWORK FIRST PARA NAVEGACIONES
   * -------------------------------------------------------
   *
   * Se intenta obtener la página actualizada.
   * Si no hay conexión, se utiliza la página precacheada.
   */
  if (isNavigationRequest(request)) {
    event.respondWith(
      networkFirst(request).catch(async () => {
        const cachedHome = await caches.match("/");

        if (cachedHome) {
          return cachedHome;
        }

        return new Response(
          `<!DOCTYPE html>
          <html lang="es-MX">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Sin conexión</title>
            </head>
            <body>
              <main>
                <h1>Sin conexión</h1>
                <p>
                  No hay conexión disponible y esta página
                  todavía no está disponible sin conexión.
                </p>
              </main>
            </body>
          </html>`,
          {
            status: 503,
            headers: {
              "Content-Type": "text/html; charset=utf-8",
            },
          }
        );
      })
    );

    return;
  }

  /*
   * -------------------------------------------------------
   * CACHE FIRST
   * -------------------------------------------------------
   *
   * Iconos y recursos estáticos.
   */
  if (
    url.pathname.startsWith("/icons/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  /*
   * Recursos estáticos de Next.js:
   * Cache First.
   *
   * La función cacheFirst normaliza la URL
   * eliminando los parámetros ?v=...
   */
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  /*
   * Otros recursos estáticos:
   * Cache First.
   */
  if (STATIC_DESTINATIONS.has(request.destination)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  /*
   * -------------------------------------------------------
   * STALE WHILE REVALIDATE
   * -------------------------------------------------------
   * 
   * Recursos que pueden actualizarse periódicamente:
   */
  if (shouldRevalidate(url)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  /*
   * -------------------------------------------------------
   * NETWORK FIRST PARA DATOS DE INSPECCIONES
   * -------------------------------------------------------
   *
   * Esta ruta queda preparada para cuando el proyecto
   * obtenga las inspecciones mediante una API.
   */
  if (url.pathname.startsWith("/api/inspections")) {
    event.respondWith(networkFirst(request));
    return;
  }

  /*
   * -------------------------------------------------------
   * NETWORK ONLY
   * -------------------------------------------------------
   *
   * Cualquier solicitud que no haya sido clasificada
   * anteriormente permanece en red.
   */
  event.respondWith(networkOnly(request));
});