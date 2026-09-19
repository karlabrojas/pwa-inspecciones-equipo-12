"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    /*
     * Comprobar si el navegador soporta Service Workers.
     */
    if (!("serviceWorker" in navigator)) {
      console.warn(
        "[PWA] Este navegador no soporta Service Workers."
      );

      return;
    }

    const registerServiceWorker = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.info(
            "[PWA] Service Worker registrado correctamente.",
            registration.scope
          );
        })
        .catch((error) => {
          /*
           * El error se registra, pero no se bloquea
           * el funcionamiento de la aplicación.
           */
          console.error(
            "[PWA] Error al registrar el Service Worker:",
            error
          );
        });
    };

    /*
     * Registrar después de que la página haya cargado.
     */
    if (document.readyState === "complete") {
      registerServiceWorker();
    } else {
      window.addEventListener(
        "load",
        registerServiceWorker,
        { once: true }
      );
    }

    return () => {
      window.removeEventListener(
        "load",
        registerServiceWorker
      );
    };
  }, []);

  return null;
}