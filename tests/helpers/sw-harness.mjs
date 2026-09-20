/**
 * Harness determinista para probar public/sw.js sin navegador.
 *
 * Carga el codigo REAL del Service Worker dentro de un sandbox (node:vm) con
 * `caches`, `fetch`, `clients` y `self` simulados. No usa red real, servicios
 * privados ni PII: todas las respuestas son sinteticas.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

export const ORIGIN = "https://lab-inspecciones.test";
export const SW_FILE = fileURLToPath(new URL("../../public/sw.js", import.meta.url));

export function readServiceWorkerSource() {
  return readFileSync(SW_FILE, "utf8");
}

const toUrl = (input) => {
  if (typeof input === "string") return new URL(input, ORIGIN).href;
  if (input instanceof URL) return input.href;
  return new URL(input.url, ORIGIN).href;
};

const html = (body, status = 200) =>
  new Response(body, { status, headers: { "content-type": "text/html" } });

/* ---------- CacheStorage simulado ---------- */
export function createFakeCaches() {
  const stores = new Map();

  const makeCache = (store) => {
    const add = async (req) => {
      const url = toUrl(req);
      store.set(url, html(`sintetico:${url}`));
    };
    return {
      add,
      async addAll(reqs) {
        for (const r of reqs) await add(r);
      },
      async match(req) {
        const hit = store.get(toUrl(req));
        return hit ? hit.clone() : undefined;
      },
      async put(req, res) {
        store.set(toUrl(req), res.clone());
      },
      async delete(req) {
        return store.delete(toUrl(req));
      },
      async keys() {
        return [...store.keys()].map((u) => new Request(u));
      },
    };
  };

  const api = {
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map());
      return makeCache(stores.get(name));
    },
    async has(name) {
      return stores.has(name);
    },
    async keys() {
      return [...stores.keys()];
    },
    async delete(name) {
      return stores.delete(name);
    },
    async match(req) {
      for (const store of stores.values()) {
        const hit = store.get(toUrl(req));
        if (hit) return hit.clone();
      }
      return undefined;
    },
  };

  return { api, stores };
}

/* ---------- Red simulada ---------- */
export function createFakeNetwork() {
  const state = { online: true, calls: [], routes: new Map() };
  const fetchFn = async (input) => {
    const url = toUrl(input);
    state.calls.push(url);
    if (!state.online) throw new TypeError("Failed to fetch");
    const route = state.routes.get(url);
    return route ? route() : html(`red:${url}`);
  };
  return { state, fetchFn };
}

/* ---------- Carga del Service Worker ---------- */
export function loadServiceWorker() {
  const listeners = {};
  const caches = createFakeCaches();
  const network = createFakeNetwork();
  const flags = { skipWaiting: 0, clientsClaim: 0 };
  const logs = { warn: [], error: [] };

  const sandbox = {
    console: {
      log() {},
      warn: (...a) => logs.warn.push(a),
      error: (...a) => logs.error.push(a),
    },
    URL,
    Request,
    Response,
    Headers,
    setTimeout,
    clearTimeout,
    caches: caches.api,
    fetch: network.fetchFn,
    location: { origin: ORIGIN, href: `${ORIGIN}/sw.js` },
    registration: { scope: `${ORIGIN}/` },
    clients: {
      claim: async () => {
        flags.clientsClaim++;
      },
      matchAll: async () => [],
    },
    skipWaiting: async () => {
      flags.skipWaiting++;
    },
    addEventListener: (type, listener) => {
      (listeners[type] ??= []).push(listener);
    },
  };
  sandbox.self = sandbox;

  vm.createContext(sandbox);
  vm.runInContext(readServiceWorkerSource(), sandbox, { filename: SW_FILE });

  // Deja correr las tareas en segundo plano (p. ej. stale-while-revalidate).
  const flush = () => new Promise((r) => setTimeout(r, 0));

  async function dispatchExtendable(type) {
    const waits = [];
    const event = {
      type,
      waitUntil: (p) => {
        waits.push(Promise.resolve(p));
      },
    };
    for (const l of listeners[type] ?? []) l(event);
    await Promise.all(waits);
    await flush();
  }

  /**
   * Simula un FetchEvent.
   * Devuelve { response } si el SW respondio, o { error } si su promesa fallo
   * (equivale a un "network error" en el navegador).
   */
  async function fetchEvent(url, opts = {}) {
    const navigate = opts.navigate ?? false;
    const request = {
      url: new URL(url, ORIGIN).href,
      method: opts.method ?? "GET",
      mode: navigate ? "navigate" : "cors",
      destination: navigate ? "document" : (opts.destination ?? "script"),
      credentials: "same-origin",
      cache: "default",
      headers: new Headers(navigate ? { accept: "text/html" } : {}),
      clone() {
        return request;
      },
    };

    const out = {};
    const event = {
      type: "fetch",
      request,
      respondWith: (r) => {
        out.promise = Promise.resolve(r);
      },
      waitUntil: () => {},
    };
    for (const l of listeners.fetch ?? []) l(event);

    if (!out.promise) {
      await flush();
      return { passedThrough: true };
    }
    try {
      const response = await out.promise;
      await flush();
      return { response };
    } catch (error) {
      await flush();
      return { error };
    }
  }

  /** Todas las URLs guardadas en cualquier cache. */
  async function cachedUrls() {
    return [...caches.stores.values()].flatMap((s) => [...s.keys()]);
  }

  return {
    listeners,
    caches,
    network,
    flags,
    logs,
    install: () => dispatchExtendable("install"),
    activate: () => dispatchExtendable("activate"),
    fetchEvent,
    cachedUrls,
  };
}