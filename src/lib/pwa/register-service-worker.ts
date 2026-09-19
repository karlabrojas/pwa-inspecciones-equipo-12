export function registerServiceWorker(): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("[PWA] Service Worker registrado:", registration.scope);
      })
      .catch((error) => {
        console.error("[PWA] Error al registrar el Service Worker:", error);
      });
  });
}
