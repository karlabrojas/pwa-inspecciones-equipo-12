# Capacidades del dispositivo y notificaciones — Semana 6

Este documento describe las capacidades opcionales de la PWA de inspecciones: cámara, geolocalización y notificaciones locales. Las tres son **opcionales**: si el navegador no las ofrece, el usuario rechaza el permiso o ocurre un error, el flujo principal de inspecciones sigue funcionando.

## Resumen

| Capacidad | Archivo | API del navegador | Se solicita cuando |
|---|---|---|---|
| Cámara | `src/lib/device/camera.ts` | `navigator.mediaDevices.getUserMedia` | Solo al llamar `requestCamera()` |
| Geolocalización | `src/lib/device/geolocation.ts` | `navigator.geolocation.getCurrentPosition` | Solo al llamar `requestGeolocation()` |
| Notificaciones | `src/lib/notifications/client.ts` | `Notification` | Solo al llamar `requestNotificationPermission()` (botón **Activar notificaciones**) |

Ninguna capacidad se solicita al cargar la aplicación. Consultar el estado del permiso de notificaciones (`getNotificationPermissionState`) no abre ningún diálogo.

## Permisos mínimos

- **Cámara:** solo video (`video: true`, `audio: false`). No se solicita micrófono. `stopCamera(stream)` detiene todas las pistas del stream.
- **Geolocalización:** baja precisión (`enableHighAccuracy: false`), reutiliza una posición de hasta 5 minutos (`maximumAge: 300000`) y espera como máximo 10 segundos (`timeout: 10000`).
- **Notificaciones:** el permiso se pide solo si el estado actual es `default`. Si ya es `granted` o `denied`, no se vuelve a preguntar. Los avisos por evento (`showInspectionNotification`) nunca piden permiso: solo muestran el aviso si ya fue concedido.

## Privacidad y datos recolectados

- Las funciones de cámara y geolocalización no guardan ni envían nada: devuelven el resultado a quien las llama. El stream de la cámara solo existe en memoria hasta que se detiene.
- Las coordenadas devueltas por la geolocalización son datos sensibles. Quien integre esta capacidad a un flujo debe decidir qué guardar y guardar solo lo necesario.
- Los avisos de notificación usan texto genérico, sin nombres, identificadores ni datos personales (hay una prueba que lo verifica).
- Las pruebas usan únicamente datos sintéticos y APIs simuladas. No dependen de servicios externos, credenciales ni claves privadas.

## Fallback

Las funciones devuelven un resultado en lugar de lanzar excepciones, de modo que el flujo principal puede continuar sin evidencia o sin aviso.

| Situación | Cámara | Geolocalización | Notificaciones |
|---|---|---|---|
| API inexistente | `reason: "unsupported"` | `reason: "unsupported"` | `status: "unsupported"` |
| Permiso denegado | `reason: "permission-denied"` (`NotAllowedError` o `SecurityError`) | `reason: "permission-denied"` (código 1) | `status: "denied"` |
| Otro fallo | `reason: "error"` (conserva el error original) | `reason: "error"` (códigos 2 y 3, p. ej. timeout) | `status: "error"` |
| Permiso aún en `default` | No aplica | No aplica | `status: "permission-required"` en avisos por evento |

La interfaz de notificaciones muestra el mensaje del resultado con `role="status"` y `aria-live="polite"`.

## Cómo se prueban

- `tests/capabilities.spec.ts` (18 pruebas): cámara y geolocalización disponibles, no soportadas, permiso denegado y errores; que el acceso solo ocurre al invocar la función; notificaciones con permiso concedido, denegado y sin API; y que el flujo principal (encolar una inspección) continúa cuando ninguna capacidad está disponible.
- `tests/notifications.spec.ts` (8 pruebas): estados de permiso, solicitud explícita, avisos por evento y errores.
- Son deterministas: reemplazan `navigator` temporalmente (y lo restauran) o inyectan una API de notificaciones falsa. No usan red, temporizadores reales ni permisos reales del navegador.

## Supuestos

- Node.js con soporte de `--experimental-strip-types` (22.6 o superior; la versión exacta de CI está en `.github/workflows`).
- Un navegador moderno servido por HTTPS o `localhost`.
- Los permisos pueden cambiar en cualquier momento desde la configuración del navegador.

## Errores conocidos y limitaciones

- Cámara y geolocalización existen como funciones; **todavía no están conectadas a ninguna pantalla**, y la cámara devuelve un stream, no captura ni adjunta una foto a la inspección.
- Los avisos por evento (`showInspectionNotification`) aún no se invocan desde ningún flujo; solo está conectado el botón **Activar notificaciones**.
- Las notificaciones son locales, no push: no garantizan avisar con la pestaña cerrada. En algunos navegadores móviles el constructor `Notification` no está permitido y se requiere el Service Worker; en ese caso el cliente devuelve `status: "error"`.
- Un contexto inseguro (sin HTTPS) lanza `SecurityError`, que se reporta como `permission-denied` aunque el usuario no haya rechazado nada.
- `camera.ts` y `geolocation.ts` acceden a `navigator` directamente: fuera de un navegador sin ese objeto lanzarían `ReferenceError`.
- Las pruebas no se ejecutan en un navegador real, así que no verifican el diálogo de permisos ni el comportamiento entre navegadores.
- `npm ci` reporta 3 vulnerabilidades en dependencias (2 altas, 1 crítica). No se aplicó `npm audit fix --force` porque puede introducir cambios incompatibles con Next.js.

## Evidencia reproducible

```bash
npm ci
npm test
make verify
```

`make verify` genera `reports/verification.json`. El resultado de GitHub Actions y la evidencia individual están en `evidence/individual.md`.